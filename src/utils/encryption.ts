const ENCRYPTION_ALGORITHM = 'AES-GCM';
const PBKDF2_ALGORITHM = 'PBKDF2';
const PBKDF2_ITERATIONS = 100000;
const SALT_SIZE = 16;
const IV_SIZE = 12;

const getPasswordKey = async (password: string) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: PBKDF2_ALGORITHM },
    false,
    ['deriveBits', 'deriveKey']
  );
  return keyMaterial;
};

const deriveKey = async (passwordKey: CryptoKey, salt: Uint8Array) => {
  return window.crypto.subtle.deriveKey(
    {
      name: PBKDF2_ALGORITHM,
      salt: salt as any,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptData = async (data: string, password: string): Promise<string> => {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const passwordKey = await getPasswordKey(password);
  const key = await deriveKey(passwordKey, salt);

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv
    },
    key,
    enc.encode(data)
  );

  const encryptedContentArr = new Uint8Array(encryptedContent);
  const buf = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContentArr.byteLength);
  buf.set(salt, 0);
  buf.set(iv, salt.byteLength);
  buf.set(encryptedContentArr, salt.byteLength + iv.byteLength);

  return btoa(String.fromCharCode.apply(null, Array.from(buf)));
};

export const decryptData = async (encryptedBase64: string, password: string): Promise<string> => {
  const dec = new TextDecoder();
  const bufStr = atob(encryptedBase64);
  const buf = new Uint8Array(bufStr.length);
  for (let i = 0; i < bufStr.length; i++) {
    buf[i] = bufStr.charCodeAt(i);
  }

  const salt = buf.slice(0, SALT_SIZE);
  const iv = buf.slice(SALT_SIZE, SALT_SIZE + IV_SIZE);
  const data = buf.slice(SALT_SIZE + IV_SIZE);

  const passwordKey = await getPasswordKey(password);
  const key = await deriveKey(passwordKey, salt);

  const decryptedContent = await window.crypto.subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv
    },
    key,
    data
  );

  return dec.decode(decryptedContent);
};

export const generateHash = async (data: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
