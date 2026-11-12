// Gerador de Payload Pix (Padrão EMVCo / Banco Central do Brasil) + QR Code

function formatEMV(id, value) {
    const val = String(value || '');
    const len = String(val.length).padStart(2, '0');
    return `${id}${len}${val}`;
}

function removeAccents(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim();
}

function crc16CCITT(payload) {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    for (let i = 0; i < payload.length; i++) {
        crc ^= (payload.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ polynomial) & 0xFFFF;
            } else {
                crc = (crc << 1) & 0xFFFF;
            }
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Gera o código Pix Copia e Cola (BR Code) com valor pré-definido
 */
export function gerarPayloadPix({
    chave = 'regiao655@gmail.com',
    nomeRecebedor = 'IEQ CENTRAL LONDRINA',
    cidade = 'LONDRINA',
    valor = 0,
    txid = 'CENTRALKKIDS'
}) {
    const chaveLimpa = String(chave || 'regiao655@gmail.com').trim();
    const nomeLimpo = removeAccents(nomeRecebedor).toUpperCase().slice(0, 25) || 'CENTRAL KIDS';
    const cidadeLimpa = removeAccents(cidade).toUpperCase().slice(0, 15) || 'LONDRINA';
    const txidLimpo = removeAccents(txid).replace(/\s+/g, '').toUpperCase().slice(0, 25) || '***';

    // Merchant Account Information (ID 26)
    const gui = formatEMV('00', 'br.gov.bcb.pix');
    const keyField = formatEMV('01', chaveLimpa);
    const merchantAccount = formatEMV('26', gui + keyField);

    // Valor formatado com 2 casas decimais
    const valorNum = Number(valor);
    const transactionAmount = valorNum > 0 ? formatEMV('54', valorNum.toFixed(2)) : '';

    // Additional Data Field Template (ID 62) -> Reference Label (05)
    const additionalData = formatEMV('62', formatEMV('05', txidLimpo));

    const payloadSemCRC =
        formatEMV('00', '01') +                 // Payload Format Indicator
        merchantAccount +                       // Merchant Account Info
        formatEMV('52', '0000') +               // Merchant Category Code
        formatEMV('53', '986') +                // Transaction Currency (986 = BRL)
        transactionAmount +                     // Transaction Amount
        formatEMV('58', 'BR') +                 // Country Code
        formatEMV('59', nomeLimpo) +            // Merchant Name
        formatEMV('60', cidadeLimpa) +          // Merchant City
        additionalData +                        // Additional Data (TXID)
        '6304';                                 // CRC16 ID + Length

    const crc = crc16CCITT(payloadSemCRC);
    return payloadSemCRC + crc;
}

/**
 * Gera a URL da imagem de QR Code (com fallback primário e secundário)
 */
export function gerarUrlQrCode(texto, tamanho = 240) {
    const encoded = encodeURIComponent(texto);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${tamanho}x${tamanho}&margin=10&data=${encoded}`;
}
