import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление бронированиями - создание и получение заявок
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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
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
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        booking_date = body_data.get('booking_date')
        client_name = body_data.get('client_name', '')
        client_phone = body_data.get('client_phone', '')
        client_email = body_data.get('client_email', '')
        service_type = body_data.get('service_type', '')
        
        if not booking_date:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'booking_date is required'}),
                'isBase64Encoded': False
            }
        
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO bookings (booking_date, client_name, client_phone, client_email, service_type) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (booking_date, client_name, client_phone, client_email, service_type)
        )
        booking_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': booking_id, 'message': 'Booking created successfully'}),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        admin_password = event.get('headers', {}).get('X-Admin-Password', '')
        
        if admin_password != 'photographer2024':
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM bookings ORDER BY booking_date DESC")
        bookings = cursor.fetchall()
        cursor.close()
        conn.close()
        
        bookings_list = []
        for booking in bookings:
            bookings_list.append({
                'id': booking['id'],
                'booking_date': str(booking['booking_date']),
                'client_name': booking['client_name'],
                'client_phone': booking['client_phone'],
                'client_email': booking['client_email'],
                'service_type': booking['service_type'],
                'status': booking['status'],
                'created_at': str(booking['created_at'])
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'bookings': bookings_list}),
            'isBase64Encoded': False
        }
    
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
