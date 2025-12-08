debug.log("Analog clock widget loaded");
{
const parentDiv = document.currentScript.parentElement;

// Get settings from URL parameters
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);

// Parse settings from URL parameters
const settings = {
  timezone: url.searchParams.get('timezone') || 'local',
  size: parseInt(url.searchParams.get('size')) || 300,
  showNumbers: url.searchParams.get('showNumbers') !== 'false', // default true
  backgroundColor: url.searchParams.get('backgroundColor') || '#ffffff',
  borderColor: url.searchParams.get('borderColor') || '#333',
  hourHandColor: url.searchParams.get('hourHandColor') || '#333',
  minuteHandColor: url.searchParams.get('minuteHandColor') || '#666',
  secondHandColor: url.searchParams.get('secondHandColor') || '#e74c3c',
  textColor: url.searchParams.get('textColor') || '#333'
};

// Create style element
const style = document.createElement('style');
style.textContent = `
  .analog-clock-canvas {
    border: 2px solid ${settings.borderColor};
    border-radius: 50%;
    display: block;
    margin: 20px auto;
  }
`;
parentDiv.appendChild(style);

// Create canvas element
const canvas = document.createElement('canvas');
canvas.className = 'analog-clock-canvas';
canvas.width = settings.size;
canvas.height = settings.size;
parentDiv.appendChild(canvas);

const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const clockRadius = (settings.size / 2) - 10;

function drawClock() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw clock face
  ctx.beginPath();
  ctx.arc(centerX, centerY, clockRadius, 0, 2 * Math.PI);
  ctx.fillStyle = settings.backgroundColor;
  ctx.fill();
  ctx.strokeStyle = settings.borderColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Draw hour markers
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) * Math.PI / 180;
    const x1 = centerX + Math.cos(angle - Math.PI / 2) * (clockRadius - 20);
    const y1 = centerY + Math.sin(angle - Math.PI / 2) * (clockRadius - 20);
    const x2 = centerX + Math.cos(angle - Math.PI / 2) * (clockRadius - 10);
    const y2 = centerY + Math.sin(angle - Math.PI / 2) * (clockRadius - 10);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = settings.textColor;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Draw hour numbers
  if (settings.showNumbers) {
    ctx.font = `bold ${Math.round(settings.size / 15)}px Arial`;
    ctx.fillStyle = settings.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      const x = centerX + Math.cos(angle) * (clockRadius - 40);
      const y = centerY + Math.sin(angle) * (clockRadius - 40);
      ctx.fillText(i.toString(), x, y);
    }
  }
  
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  
  // Draw hour hand
  const hourAngle = ((hours + minutes / 60) * 30 - 90) * Math.PI / 180;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(hourAngle) * (clockRadius * 0.43),
    centerY + Math.sin(hourAngle) * (clockRadius * 0.43)
  );
  ctx.strokeStyle = settings.hourHandColor;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Draw minute hand
  const minuteAngle = ((minutes + seconds / 60) * 6 - 90) * Math.PI / 180;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(minuteAngle) * (clockRadius * 0.64),
    centerY + Math.sin(minuteAngle) * (clockRadius * 0.64)
  );
  ctx.strokeStyle = settings.minuteHandColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Draw second hand
  const secondAngle = (seconds * 6 - 90) * Math.PI / 180;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(secondAngle) * (clockRadius * 0.71),
    centerY + Math.sin(secondAngle) * (clockRadius * 0.71)
  );
  ctx.strokeStyle = settings.secondHandColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Draw center dot
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
  ctx.fillStyle = settings.hourHandColor;
  ctx.fill();
  
  requestAnimationFrame(drawClock);
}

drawClock();
}