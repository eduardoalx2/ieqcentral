export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

export function receiptMime(bytes) {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if ([137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) return 'image/png';
  if (String.fromCharCode(...bytes.slice(0,5)) === '%PDF-') return 'application/pdf';
  return '';
}

async function loadImage(file) {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve,reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(Error('Não foi possível abrir esta foto. Salve o comprovante como JPG, PNG ou PDF pelo aplicativo do banco e anexe o arquivo.'));
      image.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}

export async function prepareReceipt(file) {
  if (!file || !file.size) throw Error('Selecione uma foto ou um PDF do comprovante.');
  if (file.size > 25 * 1024 * 1024) throw Error('Este arquivo é muito grande. Salve o comprovante em PDF ou envie uma captura de tela.');
  const mime = receiptMime(new Uint8Array(await file.slice(0,12).arrayBuffer()));
  if (mime === 'application/pdf') {
    if (file.size > MAX_RECEIPT_BYTES) throw Error('O PDF ultrapassa 5 MB. Exporte somente o comprovante pelo banco ou envie uma captura de tela.');
    return new Blob([file], {type:mime});
  }
  if (!mime && !file.type.startsWith('image/') && !/\.(heic|heif|jpe?g|png|webp)$/i.test(file.name)) {
    throw Error('Envie uma foto, uma captura de tela ou o PDF do comprovante.');
  }
  const image = await loadImage(file);
  const scale = Math.min(1,1800 / Math.max(image.naturalWidth,image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1,Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1,Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw Error('Não foi possível preparar a foto. Tente anexar o PDF do banco.');
  context.fillStyle = '#fff'; context.fillRect(0,0,canvas.width,canvas.height);
  context.drawImage(image,0,0,canvas.width,canvas.height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/jpeg',0.86));
  if (!blob || blob.size > MAX_RECEIPT_BYTES) throw Error('Não foi possível reduzir esta foto. Envie o PDF do banco ou uma captura de tela.');
  return blob;
}

export function receiptBase64(blob) {
  return new Promise((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(Error('Não foi possível ler o arquivo. Selecione-o novamente.'));
    reader.readAsDataURL(blob);
  });
}
