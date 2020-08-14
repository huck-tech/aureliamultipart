
export class Xhr {
    static toText(xhr) {
        const responseText = xhr.responseText || '(No response text)';
        return `[${xhr.status}] ${xhr.statusText} - ${responseText}`;
    }
}