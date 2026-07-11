import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext.jsx';

const VIEWPORT_SIZE = 360;
const CROP_SIZE = 300;
const OUTPUT_SIZE = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const getImageLayout = ({ image, zoom, offset }) => {
  const baseScale = Math.max(CROP_SIZE / image.width, CROP_SIZE / image.height);
  const displayWidth = image.width * baseScale * zoom;
  const displayHeight = image.height * baseScale * zoom;

  return {
    displayWidth,
    displayHeight,
    drawX: ((VIEWPORT_SIZE - displayWidth) / 2) + offset.x,
    drawY: ((VIEWPORT_SIZE - displayHeight) / 2) + offset.y
  };
};

const createCroppedProfileFile = async ({ imageSrc, fileName, zoom, offset }) => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext('2d');

  const { displayWidth, displayHeight, drawX, drawY } = getImageLayout({ image, zoom, offset });
  const cropStart = (VIEWPORT_SIZE - CROP_SIZE) / 2;
  const outputScale = OUTPUT_SIZE / CROP_SIZE;

  context.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.save();
  context.beginPath();
  context.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
  context.closePath();
  context.clip();
  context.drawImage(
    image,
    (drawX - cropStart) * outputScale,
    (drawY - cropStart) * outputScale,
    displayWidth * outputScale,
    displayHeight * outputScale
  );
  context.restore();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
  if (!blob) throw new Error('Could not crop image.');

  const safeName = (fileName || 'profile-image').replace(/\.[^/.]+$/, '');
  return new File([blob], `${safeName}-profile.png`, { type: 'image/png' });
};

function ProfileImageCropper({
  show,
  file,
  title = 'Adjust profile photo',
  confirmLabel = 'Use this photo',
  onCancel,
  onConfirm
}) {
  const { colors, isDark } = useTheme();
  const canvasRef = useRef(null);
  const dragStateRef = useRef({ active: false, x: 0, y: 0 });

  const [imageSrc, setImageSrc] = useState('');
  const [imageElement, setImageElement] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!file || !show) {
      setImageSrc('');
      setImageElement(null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setDragging(false);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setDragging(false);

    loadImage(objectUrl)
      .then((image) => setImageElement(image))
      .catch(() => setImageElement(null));

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, show]);

  const bounds = useMemo(() => {
    if (!imageElement) return { x: 0, y: 0 };
    const baseScale = Math.max(CROP_SIZE / imageElement.width, CROP_SIZE / imageElement.height);
    const displayWidth = imageElement.width * baseScale * zoom;
    const displayHeight = imageElement.height * baseScale * zoom;

    return {
      x: Math.max(0, (displayWidth - CROP_SIZE) / 2),
      y: Math.max(0, (displayHeight - CROP_SIZE) / 2)
    };
  }, [imageElement, zoom]);

  const clampOffset = useCallback((nextOffset) => ({
    x: clamp(nextOffset.x, -bounds.x, bounds.x),
    y: clamp(nextOffset.y, -bounds.y, bounds.y)
  }), [bounds]);

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageElement) return;

    canvas.width = VIEWPORT_SIZE;
    canvas.height = VIEWPORT_SIZE;
    const context = canvas.getContext('2d');
    const { displayWidth, displayHeight, drawX, drawY } = getImageLayout({
      image: imageElement,
      zoom,
      offset
    });

    context.clearRect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);
    context.fillStyle = isDark ? '#161616' : '#f8fafc';
    context.fillRect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);
    context.drawImage(imageElement, drawX, drawY, displayWidth, displayHeight);
  }, [imageElement, offset, zoom, isDark]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  useEffect(() => {
    setOffset((previous) => {
      const next = clampOffset(previous);
      if (previous.x === next.x && previous.y === next.y) return previous;
      return next;
    });
  }, [clampOffset]);

  const handlePointerDown = (event) => {
    if (!imageElement) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStateRef.current = { active: true, x: event.clientX, y: event.clientY };
    setDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!dragStateRef.current.active) return;
    event.preventDefault();

    const deltaX = event.clientX - dragStateRef.current.x;
    const deltaY = event.clientY - dragStateRef.current.y;
    dragStateRef.current = { active: true, x: event.clientX, y: event.clientY };

    setOffset((previous) => clampOffset({
      x: previous.x + deltaX,
      y: previous.y + deltaY
    }));
  };

  const handlePointerEnd = (event) => {
    dragStateRef.current.active = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDragging(false);
  };

  const handleWheel = (event) => {
    if (!imageElement) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    setZoom((previous) => clamp(Number((previous + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM));
  };

  const handleZoomChange = (value) => {
    setZoom(clamp(Number(value), MIN_ZOOM, MAX_ZOOM));
  };

  const resetCrop = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirm = async () => {
    if (!imageSrc || !file) return;
    setProcessing(true);
    try {
      const croppedFile = await createCroppedProfileFile({
        imageSrc,
        fileName: file.name,
        zoom,
        offset
      });
      onConfirm?.(croppedFile);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal show={show} onHide={onCancel} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-column align-items-center gap-3">
          <div
            className="position-relative overflow-hidden border shadow-sm rounded-4"
            style={{
              width: VIEWPORT_SIZE,
              height: VIEWPORT_SIZE,
              maxWidth: '86vw',
              maxHeight: '86vw',
              backgroundColor: isDark ? '#161616' : '#f8fafc',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)',
              cursor: imageElement ? (dragging ? 'grabbing' : 'grab') : 'default',
              userSelect: 'none',
              touchAction: 'none'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onLostPointerCapture={handlePointerEnd}
            onWheel={handleWheel}
          >
            <canvas
              ref={canvasRef}
              width={VIEWPORT_SIZE}
              height={VIEWPORT_SIZE}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
            <span
              className="position-absolute rounded-circle"
              style={{
                width: CROP_SIZE,
                height: CROP_SIZE,
                left: `calc(50% - ${CROP_SIZE / 2}px)`,
                top: `calc(50% - ${CROP_SIZE / 2}px)`,
                border: '4px solid rgba(255,255,255,0.98)',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.52), inset 0 0 0 1px rgba(15,23,42,0.25)',
                pointerEvents: 'none'
              }}
            />
            <span
              className="position-absolute top-50 start-50 translate-middle text-white fw-semibold small px-2 py-1 rounded-pill"
              style={{ background: 'rgba(15, 23, 42, 0.62)', pointerEvents: 'none', opacity: dragging ? 0 : 0.9 }}
            >
              Drag photo
            </span>
          </div>

          <div className="w-100" style={{ maxWidth: VIEWPORT_SIZE }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <Form.Label className="small text-muted fw-semibold mb-0">Zoom</Form.Label>
              <Button type="button" variant="link" size="sm" className="text-decoration-none p-0" onClick={resetCrop} disabled={!imageElement}>
                Reset
              </Button>
            </div>
            <Form.Range
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step="0.01"
              value={zoom}
              onChange={(event) => handleZoomChange(event.target.value)}
              disabled={!imageElement}
            />
            <div className="text-muted small text-center">
              Drag with the mouse to move the photo up, down, right, and left. Use the wheel or slider to zoom.
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel} disabled={processing}>Cancel</Button>
        <Button variant="primary" onClick={handleConfirm} disabled={!imageElement || processing}>
          {processing ? 'Cropping...' : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProfileImageCropper;
