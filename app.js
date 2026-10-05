(() => {
  'use strict';

  const form = document.querySelector('#profile-form');
  const endpointInput = document.querySelector('#endpoint');
  const serverKeyInput = document.querySelector('#server-key');
  const addressInput = document.querySelector('#client-address');
  const dnsInput = document.querySelector('#dns');
  const allowedIpsInput = document.querySelector('#allowed-ips');
  const clientPublicInput = document.querySelector('#client-public-key');
  const output = document.querySelector('#profile-output');
  const message = document.querySelector('#form-message');
  const keyCopy = document.querySelector('#copy-client-key');
  const profileCopy = document.querySelector('#copy-profile');
  const profileDownload = document.querySelector('#download-profile');
  const generateButton = document.querySelector('#generate-key');
  const keyStatus = document.querySelector('.key-status');
  const keyStatusCopy = document.querySelector('#key-status-copy');
  const copyPeerButton = document.querySelector('#copy-peer');

  let clientPrivateKey = '';
  let clientPublicKey = '';
  let lastProfile = '';

  const P = (1n << 255n) - 19n;
  const A24 = 121665n;
  const basePoint = new Uint8Array(32);
  basePoint[0] = 9;

  function mod(value) { const result = value % P; return result >= 0n ? result : result + P; }
  function modPow(base, exponent) {
    let result = 1n;
    let current = mod(base);
    let power = exponent;
    while (power > 0n) { if (power & 1n) result = mod(result * current); current = mod(current * current); power >>= 1n; }
    return result;
  }
  function decodeLittle(bytes) {
    let value = 0n;
    for (let index = bytes.length - 1; index >= 0; index -= 1) value = (value << 8n) | BigInt(bytes[index]);
    return value;
  }
  function encodeLittle(value) {
    const bytes = new Uint8Array(32);
    let current = value;
    for (let index = 0; index < 32; index += 1) { bytes[index] = Number(current & 255n); current >>= 8n; }
    return bytes;
  }
  function x25519(privateBytes, uBytes) {
    const scalar = new Uint8Array(privateBytes);
    scalar[0] &= 248; scalar[31] &= 127; scalar[31] |= 64;
    const x1 = decodeLittle(uBytes) & ((1n << 255n) - 1n);
    let x2 = 1n, z2 = 0n, x3 = x1, z3 = 1n, swap = 0;
    for (let bit = 254; bit >= 0; bit -= 1) {
      const bitValue = (scalar[bit >> 3] >> (bit & 7)) & 1;
      swap ^= bitValue;
      if (swap) { [x2, x3] = [x3, x2]; [z2, z3] = [z3, z2]; }
      swap = bitValue;
      const a = mod(x2 + z2), aa = mod(a * a), b = mod(x2 - z2), bb = mod(b * b), e = mod(aa - bb);
      const c = mod(x3 + z3), d = mod(x3 - z3), da = mod(d * a), cb = mod(c * b);
      x3 = mod((da + cb) ** 2n); z3 = mod(x1 * (da - cb) ** 2n); x2 = mod(aa * bb); z2 = mod(e * (aa + A24 * e));
    }
    if (swap) { [x2, x3] = [x3, x2]; [z2, z3] = [z3, z2]; }
    return encodeLittle(mod(x2 * modPow(z2, P - 2n)));
  }
  function randomBytes(length) { const bytes = new Uint8Array(length); crypto.getRandomValues(bytes); return bytes; }
  function toBase64(bytes) { let binary = ''; bytes.forEach((byte) => { binary += String.fromCharCode(byte); }); return btoa(binary); }
  function generateKeypair() {
    const privateBytes = randomBytes(32);
    clientPrivateKey = toBase64(privateBytes);
    clientPublicKey = toBase64(x25519(privateBytes, basePoint));
    clientPublicInput.value = clientPublicKey;
    keyCopy.disabled = false;
    keyStatus.classList.add('ready');
    keyStatusCopy.textContent = 'Chaves prontas. Cadastre a chave pública no servidor antes de ativar o perfil.';
    setMessage('Chave do cliente gerada localmente.', 'success');
  }
  function cleanEndpoint(value) { return value.trim().replace(/^udp:\/\//i, ''); }
  function escapeHtml(value) { return value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char])); }
  function configText() {
    const endpoint = cleanEndpoint(endpointInput.value);
    const serverKey = serverKeyInput.value.trim();
    const address = addressInput.value.trim();
    const dns = dnsInput.value.trim();
    const allowedIps = allowedIpsInput.value.trim();
    const lines = ['[Interface]', `PrivateKey = ${clientPrivateKey}`, `Address = ${address}`];
    if (dns) lines.push(`DNS = ${dns}`);
    lines.push('', '[Peer]', `PublicKey = ${serverKey}`, `AllowedIPs = ${allowedIps}`, `Endpoint = ${endpoint}`, 'PersistentKeepalive = 25');
    return lines.join('\n');
  }
  function renderProfile() {
    lastProfile = configText();
    output.textContent = lastProfile;
    profileCopy.disabled = false;
    profileDownload.disabled = false;
  }
  function setMessage(text, type = '') { message.textContent = text; message.className = `form-message ${type}`.trim(); }
  async function copyText(text, successText) {
    try { await navigator.clipboard.writeText(text); setMessage(successText, 'success'); }
    catch { setMessage('Não foi possível copiar automaticamente. Selecione o conteúdo e copie manualmente.', 'error'); }
  }
  function validBase64Key(value) { return /^[A-Za-z0-9+/]{40,46}={0,2}$/.test(value); }

  generateButton.addEventListener('click', generateKeypair);
  keyCopy.addEventListener('click', () => copyText(clientPublicKey, 'Chave pública copiada. Agora cadastre-a no servidor.'));
  profileCopy.addEventListener('click', () => copyText(lastProfile, 'Perfil completo copiado para a área de transferência.'));
  profileDownload.addEventListener('click', () => {
    const blob = new Blob([lastProfile + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'tunnelkit-client.conf'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    setMessage('Download iniciado. Importe o .conf no app WireGuard.', 'success');
  });
  copyPeerButton.addEventListener('click', () => {
    const peer = `[Peer]\nPublicKey = ${clientPublicKey || 'CHAVE_PUBLICA_DO_CLIENTE'}\nAllowedIPs = ${addressInput.value.trim() || '10.8.0.2/32'}`;
    copyText(peer, 'Bloco de peer copiado. Cole no wg0.conf do servidor.');
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const endpoint = cleanEndpoint(endpointInput.value);
    if (!endpoint || !serverKeyInput.value.trim() || !addressInput.value.trim() || !allowedIpsInput.value.trim()) {
      setMessage('Preencha os campos obrigatórios marcados com *.', 'error'); return;
    }
    if (!clientPrivateKey) generateKeypair();
    if (!validBase64Key(serverKeyInput.value.trim())) {
      setMessage('A chave pública do servidor parece incompleta. Cole a chave Base64 de 32 bytes.', 'error'); return;
    }
    renderProfile();
    setMessage('Perfil montado localmente. Cadastre a chave pública no servidor e importe o arquivo no WireGuard.', 'success');
    document.querySelector('.profile-preview').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      event.preventDefault(); target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Gera uma identidade inicial apenas quando o usuário solicitar: a chave privada não fica persistida.
  if (!window.crypto || !window.crypto.getRandomValues) {
    generateButton.disabled = true;
    setMessage('Este navegador não oferece criptografia segura para gerar chaves.', 'error');
  }
})();
