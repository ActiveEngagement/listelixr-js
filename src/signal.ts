let currentListener: (() => void)|undefined = undefined;

export type ReadFunction<T> = () => T|undefined;
export type WriteFunction<T> = (value: T|undefined) => void;
export type ResetFunction<T> = () => T|undefined;

export function createSignal<T>(initialValue: T): [ReadFunction<T>, WriteFunction<T>, ResetFunction<T>] {
    let value: T|undefined = initialValue;

    const subscribers: Function[] = [];

    function read() {
        if(currentListener) {
            subscribers.push(currentListener);
        }

        return value;
    };

    function write(newValue?: T) {
        value = newValue;

        subscribers.forEach(fn => fn());
    };

    function reset() {
        value = initialValue;

        subscribers.splice(0, subscribers.length);

        return value;
    };

    return [read, write, reset];
}

export type Ref<T> = {
	value: T
}

export function ref<T>(value: T): Ref<T>
export function ref<T>(value?: T): Ref<T|undefined>
export function ref<T>(value: T): Ref<T|undefined> {
    const [ getValue, setValue ] = createSignal(value);

    return new Proxy({ value }, {
        get() {
            return getValue();
        },
        set(target, _, value: T) {
            target.value = value;

            setValue(value);

            return true;
        }
    });
}

export function watchEffect(callback: () => void) {
    currentListener = callback;
    callback();
    currentListener = undefined;
}

export type ComputedGetter<T> = () => T;

export type ComputedGetterSetter<T> = {
	get(): T,
	set(value: T): void
};

export type ComputedRef<T> = Readonly<Ref<T>>
export type WriteableComputedRef<T> = Ref<T>

export function computed<T>(proxy: ComputedGetterSetter<T>): WriteableComputedRef<T>
export function computed<T>(fn: ComputedGetter<T>): ComputedRef<T>
export function computed<T>(fn: ComputedGetter<T> | ComputedGetterSetter<T>) {
    return typeof fn === 'function' ? {
        get value() {
            return fn();
        }
    } : {
        get value() {
            return fn.get();
        },
        set value(value) {
            fn.set(value);
        }
    };
}