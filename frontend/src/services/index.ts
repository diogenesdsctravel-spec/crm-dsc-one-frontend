export async function archiveConversation(id: string) {
    console.log("Arquivar conversa:", id);
    return true;
}

export async function restoreConversation(id: string) {
    console.log("Restaurar conversa:", id);
    return true;
}

export function formatPhone(number: string) {
    return number;
}
