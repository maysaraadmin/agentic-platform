import aio_pika
import json
import asyncio
import logging
import os
from typing import Callable, Any

logger = logging.getLogger(__name__)

class RabbitMQService:
    def __init__(self, url: str = None):
        self.url = url or os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
        self.connection = None
        self.channel = None

    async def connect(self, retries: int = 10, delay: float = 3.0):
        for attempt in range(1, retries + 1):
            try:
                self.connection = await aio_pika.connect_robust(self.url)
                self.channel = await self.connection.channel()
                await self.channel.declare_queue("agent_tasks", durable=True)
                await self.channel.declare_queue("notification_queue", durable=True)
                logger.info("Connected to RabbitMQ")
                return
            except Exception as exc:
                logger.warning("RabbitMQ connect attempt %s/%s failed: %s", attempt, retries, exc)
                await asyncio.sleep(delay)
        raise ConnectionError("Could not connect to RabbitMQ")

    async def publish(self, queue_name: str, message: dict):
        if not self.channel:
            await self.connect()
        queue = await self.channel.declare_queue(queue_name, durable=True)
        await queue.publish(
            aio_pika.Message(body=json.dumps(message).encode(), delivery_mode=aio_pika.DeliveryMode.PERSISTENT)
        )
        logger.info("Published to %s: %s", queue_name, message)

    async def consume(self, queue_name: str, callback: Callable):
        if not self.channel:
            await self.connect()
        queue = await self.channel.declare_queue(queue_name, durable=True)
        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process():
                    await callback(json.loads(message.body.decode()))

    async def close(self):
        if self.connection:
            await self.connection.close()
            logger.info("Closed RabbitMQ connection")

rabbitmq_service = RabbitMQService()
