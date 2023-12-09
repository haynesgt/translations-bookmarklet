function save(key: string, value: any, ttl: number) {
    const now = Date.now();
    const record = { value, exp: now + ttl };
    localStorage.setItem(key, JSON.stringify(record));
}

function load(key: string) {
    const json = localStorage.getItem(key);
    if (!json) {
        return;
    }
    const record = JSON.parse(json);
    if (!record.exp || Date.now() > record.exp) {
        localStorage.removeItem(key);
        return;
    }
    return record.value;
}

function isAsyncFunction(func: Function) {
    return Object.prototype.toString.call(func) === '[object AsyncFunction]';
}

export interface CachedFunction {
    hasCachedValue(...args: any[]): boolean;
}

export function cacheWithLocalStorage<T extends Function>(
    fn: T, ttl: number = 1000 * 60 * 60 * 24 * 7
): T & CachedFunction {
    const fnName = fn.name;
    const keyPrefix = "cacheWithLocalStorage" + fnName;
    function wrapped(...args: any[]) {
        const key = keyPrefix + JSON.stringify(args);
        const cached = load(key);
        if (cached) {
            if (isAsyncFunction(fn)) {
                return Promise.resolve(cached);
            } else {
                return cached;
            }
        } else {
            const response = fn(...args);
            function saveResult(result: any) {
                save(key, result, ttl);
            }
            if (response instanceof Promise) {
                return response.then((result: any) => {
                    saveResult(result);
                    return result;
                });
            } else {
                saveResult(response);
            }
            return response;
        }
    }
    wrapped.hasCachedValue = (...args: any[]) => {
        const key = keyPrefix + JSON.stringify(args);
        return !!load(key);
    }
    return wrapped as unknown as T & CachedFunction;
}
