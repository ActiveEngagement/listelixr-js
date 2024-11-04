import { For, Show, splitProps } from 'solid-js';

export type ValidationErrors = {
    message: string;
    errors?: Record<string, string[]>;
}

export type FormFieldProps = {
    errors?: string[]|boolean;
    label?: string;
    id?: string;
	// children: JSXElement|JSXElement[];
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
    const [ fieldAttrs, { 'class': classes }, attrs ] = splitProps(
        props, ['errors', 'label', 'id'], ['class']
    );

    return (
        <FormField {...fieldAttrs}>
            <label class="form-label">
                <input type="checkbox" {...attrs} classList={{
                    'form-control': true,
                    [classes]: true,
                }} oninput={props.oninput} />
                {props.label}
            </label>            
        </FormField>
    );
}

export function RadioField(props: FormControlProps) {
    const [ fieldAttrs, { 'class': classes }, attrs ] = splitProps(
        props, ['errors', 'label', 'id'], ['class']
    );

    return (
        <FormField {...fieldAttrs}>
            <label class="form-label">
                <input type="radio" {...attrs} classList={{
                    'form-control': true,
                    [classes]: true,
                }} oninput={props.oninput} />
                {props.label}
            </label>            
        </FormField>
    );
}

export function InputField(props: FormControlProps) {
    const [ fieldAttrs, { 'class': classes }, attrs ] = splitProps(
        props, ['errors', 'label', 'id'], ['class']
    );

    return (
        <FormField {...fieldAttrs}>
            <Show when={props.label}>
                <label for={props.id} class="form-label">{props.label}</label>
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
            <div>Loading...</div>
        </>
    );
}