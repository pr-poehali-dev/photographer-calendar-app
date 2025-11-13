import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление напоминаниями - создание, получение и отправка
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    admin_password = headers.get('x-admin-password', '') or headers.get('X-Admin-Password', '')
    if admin_password != 'photographer2024':
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
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
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        booking_id = body_data.get('booking_id')
        reminder_type = body_data.get('reminder_type', 'email')
        reminder_text = body_data.get('reminder_text', '')
        send_at = body_data.get('send_at')
        client_email = body_data.get('client_email', '')
        client_phone = body_data.get('client_phone', '')
        
        if not send_at or not reminder_text:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'send_at and reminder_text are required'}),
                'isBase64Encoded': False
            }
        
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO reminders (booking_id, reminder_type, reminder_text, send_at, client_email, client_phone) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            (booking_id, reminder_type, reminder_text, send_at, client_email, client_phone)
        )
        reminder_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': reminder_id, 'message': 'Reminder created successfully'}),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM reminders ORDER BY send_at ASC")
        reminders = cursor.fetchall()
        cursor.close()
        conn.close()
        
        reminders_list = []
        for reminder in reminders:
            reminders_list.append({
                'id': reminder['id'],
                'booking_id': reminder['booking_id'],
                'reminder_type': reminder['reminder_type'],
                'reminder_text': reminder['reminder_text'],
                'send_at': str(reminder['send_at']),
                'sent': reminder['sent'],
                'sent_at': str(reminder['sent_at']) if reminder['sent_at'] else None,
                'client_email': reminder['client_email'],
                'client_phone': reminder['client_phone'],
                'created_at': str(reminder['created_at'])
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'reminders': reminders_list}),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        reminder_id = body_data.get('id')
        
        if not reminder_id:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'id is required'}),
                'isBase64Encoded': False
            }
        
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE reminders SET sent = TRUE, sent_at = %s WHERE id = %s",
            (datetime.now(), reminder_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Reminder marked as sent'}),
            'isBase64Encoded': False
        }
    
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }