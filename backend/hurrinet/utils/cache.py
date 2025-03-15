from django.core.cache import cache
from django.conf import settings
from typing import Any, Optional
import json


def get_cache_key(prefix: str, identifier: str) -> str:
    """Generate a cache key with the project prefix."""
    return f"{settings.CACHE_KEY_PREFIX}:{prefix}:{identifier}"


def set_cached_data(key: str, data: Any, timeout: Optional[int] = None) -> bool:
    """Set data in cache with optional timeout."""
    try:
        if isinstance(data, (dict, list)):
            data = json.dumps(data)
        cache.set(key, data, timeout or settings.CACHE_TTL)
        return True
    except Exception as e:
        print(f"Cache set error: {e}")
        return False


def get_cached_data(key: str) -> Any:
    """Get data from cache."""
    try:
        data = cache.get(key)
        if isinstance(data, str):
            try:
                return json.loads(data)
            except json.JSONDecodeError:
                return data
        return data
    except Exception as e:
        print(f"Cache get error: {e}")
        return None


def delete_cached_data(key: str) -> bool:
    """Delete data from cache."""
    try:
        cache.delete(key)
        return True
    except Exception as e:
        print(f"Cache delete error: {e}")
        return False


def clear_pattern(pattern: str) -> bool:
    """Clear all cache keys matching a pattern."""
    try:
        keys = cache.keys(f"{settings.CACHE_KEY_PREFIX}:{pattern}")
        cache.delete_many(keys)
        return True
    except Exception as e:
        print(f"Cache clear pattern error: {e}")
        return False


# Cache decorator for views
def cache_response(timeout: Optional[int] = None):
    """Decorator to cache view responses."""

    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            # Generate cache key from request
            cache_key = get_cache_key(
                "view", f"{request.path}:{request.method}:{json.dumps(request.GET)}"
            )

            # Try to get cached response
            cached_response = get_cached_data(cache_key)
            if cached_response is not None:
                return cached_response

            # Get fresh response
            response = view_func(request, *args, **kwargs)

            # Cache the response
            set_cached_data(cache_key, response, timeout)

            return response

        return wrapper

    return decorator
