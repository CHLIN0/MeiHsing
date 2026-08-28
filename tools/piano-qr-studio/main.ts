import './styles.css';
import { mountPianoQrStudio } from './pianoQrStudio';

const root = document.querySelector<HTMLElement>('#piano-qr-studio');

if (!root) throw new Error('Piano QR Studio root was not found.');

mountPianoQrStudio(root, {
  initialUrl: new URLSearchParams(window.location.search).get('url') ?? 'https://ms.linho.me/links/',
});
