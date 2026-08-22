import pika
import json
import asyncio
import logging
import os
from typing import Callable, Any

logger = logging.getLogger(__name__)

class RabbitMQService:
    def __init__(self, host: str = None, port: int = None, username: str = None, password: str = None):
        self.host = host or os.getenv("RABBITMQ_HOST", "localhost")
        self.port = port or int(os.getenv("RABBITMQ_PORT", "5672"))
        self.credentials = pika.PlainCredentials(
            username or os.getenv("RABBITMQ_USER", "guest"),
            password or os.getenv("RABBITMQ_PASS", "guest"),
        )
        self.connection = None
        self.channel = None

    async def connect(self, retries: int = 10, delay: float = 3.0):
        """Establish connection to RabbitMQ (retries to tolerate startup races)."""
        loop = asyncio.get_event_loop()
        last_error = None
        for attempt in range(1, retries + 1):
            try:
                self.connection = await loop.run_in_executor(
                    None,
                    lambda: pika.BlockingConnection(
                        pika.ConnectionParameters(
                            host=self.host,
                            port=self.port,
                            credentials=self.credentials,
                            socket_timeout=5,
                            connection_attempts=1,
                        )
                    ),
                )
                self.channel = self.connection.channel()
                self.channel.queue_declare(queue="agent_tasks", durable=True)
                self.channel.queue_declare(queue="notification_queue", durable=True)
                logger.info("Connected to RabbitMQ")
                return
            except Exception as exc:
                last_error = exc
                logger.warning("RabbitMQ connect attempt %s/%s failed: %s", attempt, retries, exc)
                await asyncio.sleep(delay)
        raise last_error

    async def publish(self, queue_name: str, message: dict):
        """Publish a message to a queue."""
        if not self.channel:
            await self.connect()
        self.channel.basic_publish(
            exchange="",
            routing_key=queue_name,
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        logger.info(f"Published message to {queue_name}: {message}")

    async def consume(self, queue_name: str, callback: Callable):
        """Consume messages from a queue."""
        if not self.channel:
            await self.connect()

        def wrapper(ch, method, properties, body):
            asyncio.create_task(callback(json.loads(body)))

        self.channel.basic_consume(queue=queue_name, on_message_callback=wrapper, auto_ack=True)
        logger.info(f"Started consuming from {queue_name}")

    async def close(self):
        """Close the connection."""
        if self.connection and self.connection.is_open:
            self.connection.close()
            logger.info("Closed RabbitMQ connection")

rabbitmq_service = RabbitMQService()
