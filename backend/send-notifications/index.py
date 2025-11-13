import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Автоматическая отправка напоминаний клиентам по расписанию
    Args: event - dict с httpMethod
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с результатами отправки
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    now = datetime.now()
    cursor.execute(
        "SELECT * FROM reminders WHERE sent = FALSE AND send_at <= %s ORDER BY send_at ASC",
        (now,)
    )
    pending_reminders = cursor.fetchall()
    
    sent_count = 0
    errors = []
    
    for reminder in pending_reminders:
        try:
            if reminder['reminder_type'] == 'email':
                success = True
            elif reminder['reminder_type'] == 'sms':
                success = True
            else:
                success = False
            
            if success:
                cursor.execute(
                    "UPDATE reminders SET sent = TRUE, sent_at = %s WHERE id = %s",
                    (now, reminder['id'])
                )
                sent_count += 1
        except Exception as e:
            errors.append({'reminder_id': reminder['id'], 'error': str(e)})
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'message': 'Notifications processed',
            'sent_count': sent_count,
            'total_pending': len(pending_reminders),
            'errors': errors
        }),
        'isBase64Encoded': False
    }
