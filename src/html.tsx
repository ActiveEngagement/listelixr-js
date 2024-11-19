import { For, Show, splitProps } from 'solid-js';

export type HttpError = {
    message: string
}

export type ValidationErrors = HttpError & {
    errors?: Record<string, string[]>;
}

export type FormFieldProps = {
    errors?: string[]|boolean;
    label?: string;
    description?: string;
    id?: string;
} & Record<string,any>

export function FormField(props: FormFieldProps) {    
    const [{ children }, attrs] = splitProps(
        props, ['children']
    );

    return (
        <div {...attrs} classList={{
            'form-field': true,
            'has-errors': typeof attrs.errors === 'boolean'
                ? attrs.errors
                : !!attrs.errors?.length,
        }}>
            {children}
            <Show when={Array.isArray(props.errors)}>
                <For each={Array.isArray(props.errors) ? props.errors : []}>{(error) =>
                    <div class="field-error">{error}</div>
                }</For>
            </Show>
        </div>
    );
}

type FormControlProps = FormFieldProps & Record<string,any> & {
    name?: string;
    oninput?: (e: InputEvent) => void;
}

export function CheckboxField(props: FormControlProps) {
    const [ fieldAttrs, { 'class': classes, description }, attrs ] = splitProps(
        props, ['errors', 'label', 'id'], ['class', 'description']
    );

    console.log(props.label);

    return (
        <FormField {...fieldAttrs} data-id={fieldAttrs.id} data-label={props.label}>
            <label class="form-label">
                <input type="checkbox" {...attrs} classList={{
                    'form-control': true,
                    [classes]: true,
                }} oninput={props.oninput} />
                <Show when={props.label}>
                    <div class="form-label-text">{props.label?.trim()}</div>
                </Show>
                <Show when={description}>
                    <div class="form-label-description" innerHTML={description} />
                </Show>
            </label>            
        </FormField>
    );
}

export function RadioField(props: FormControlProps) {
    const [ fieldAttrs, { 'class': classes, description }, attrs ] = splitProps(
        props, ['errors', 'label', 'id'], ['class', 'description']
    );

    return (
        <FormField {...fieldAttrs} data-id={fieldAttrs.id} data-label={props.label}>
            <label class="form-label">
                <input type="radio" {...attrs} classList={{
                    'form-control': true,
                    [classes]: true,
                }} oninput={props.oninput} />
                <Show when={props.label}>
                    <div class="form-label-text">{props.label?.trim()}</div>
                </Show>
                <Show when={description}>
                    <div class="form-label-description" innerHTML={description} />
                </Show>
            </label>            
        </FormField>
    );
}

export function InputField(props: FormControlProps) {
    const [ fieldAttrs, { 'class': classes, description }, attrs ] = splitProps(
        props, ['errors', 'label', 'id'], ['class', 'description']
    );

    return (
        <FormField {...fieldAttrs} data-id={fieldAttrs.id} data-label={props.label}>
            <Show when={props.label}>
                <label for={props.id} class="form-label">
                    <div class="form-label-text">{props.label}</div>
                    <Show when={description}>
                        <div class="form-label-description" innerHTML={description} />
                    </Show>
                </label>
            </Show>
            <input {...attrs} classList={{
                'form-control': true,
                [classes]: true,
            }} oninput={props.oninput} />
        </FormField>
    );
}

export function ActivityIndicator() {
    return (
        <>
            <span class="activity-indicator">
                <span class="activity-indicator-label">Loading...</span>
            </span>
        </>
    );
}