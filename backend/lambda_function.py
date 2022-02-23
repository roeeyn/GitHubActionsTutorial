import json


def create_message(name):
    return f"Hola soy {name}!"


def lambda_handler(event, context):
    default_name = "la lambda v1"
    name = event.get("queryStringParameters", {}).get("message", default_name)
    message = create_message(name)
    return {"statusCode": 200, "body": json.dumps(message)}
