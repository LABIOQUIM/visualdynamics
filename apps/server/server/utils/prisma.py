from functools import wraps
from typing import Callable, Any, TypeVar, cast
from prisma import Client

database = Client()
CallableT = TypeVar("CallableT", bound=Callable[..., Any])


def requires_connection(func: CallableT) -> CallableT:
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        if not database.is_connected():
            await database.connect()
        return await func(*args, **kwargs)

    return cast(CallableT, wrapper)
