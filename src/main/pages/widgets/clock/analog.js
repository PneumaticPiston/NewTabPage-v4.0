debug.log("Analog clock widget loaded");
{
const parentDiv = document.currentScript.parentElement;

// Create canvas element
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 300;
canvas.style.border = '2px solid #333';
canvas.style.borderRadius = '50%';
canvas.style.display = 'block';
canvas.style.margin = '20px auto';
parentDiv.appendChild(canvas);

const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const clockRadius = 140;

function drawClock() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw clock face
  ctx.beginPath();
  ctx.arc(centerX, centerY, clockRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#333';
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
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  
  // Draw hour numbers
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x = centerX + Math.cos(angle) * (clockRadius - 40);
    const y = centerY + Math.sin(angle) * (clockRadius - 40);
    ctx.fillText(i.toString(), x, y);
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
    centerX + Math.cos(hourAngle) * 60,
    centerY + Math.sin(hourAngle) * 60
  );
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Draw minute hand
  const minuteAngle = ((minutes + seconds / 60) * 6 - 90) * Math.PI / 180;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(minuteAngle) * 90,
    centerY + Math.sin(minuteAngle) * 90
  );
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Draw second hand
  const secondAngle = (seconds * 6 - 90) * Math.PI / 180;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(secondAngle) * 100,
    centerY + Math.sin(secondAngle) * 100
  );
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Draw center dot
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
  ctx.fillStyle = '#333';
  ctx.fill();
  
  requestAnimationFrame(drawClock);
}

drawClock();
}