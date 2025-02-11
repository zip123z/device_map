const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 提供靜態文件服務
app.use('/images', express.static(path.join(__dirname, 'images')));

// 模擬資料庫
let areas = [
  { id: 1, name: 'Area A', floorplans: ['/images/area1.svg'] },
  { id: 2, name: 'Area B', floorplans: ['/images/area2.svg'] },
  { id: 3, name: 'Area C', floorplans: ['/images/area3.svg'] },
  { id: 4, name: 'Area D', floorplans: ['/images/area4.svg'] },
  { id: 5, name: 'Area E', floorplans: ['/images/area5.svg'] },
];

let devices = [
  { id: 1, areaId: 1, x: 100, y: 200, type: '顯示器' },
  { id: 2, areaId: 1, x: 300, y: 400, type: '其他' },
  { id: 3, areaId: 2, x: 150, y: 250, type: '其他' },
  { id: 4, areaId: 2, x: 350, y: 450, type: '其他' },
  { id: 5, areaId: 3, x: 200, y: 300, type: '其他' },
  { id: 6, areaId: 3, x: 400, y: 500, type: '其他' },
  { id: 7, areaId: 4, x: 250, y: 350, type: '其他' },
  { id: 8, areaId: 4, x: 450, y: 550, type: '其他' },
  { id: 9, areaId: 5, x: 300, y: 400, type: '其他' },
  { id: 10, areaId: 5, x: 500, y: 600, type: '其他' },
];

let maintenanceRecords = [
  { id: 1, deviceId: 1, date: '2023-01-01', description: '更換零件' },
  { id: 2, deviceId: 1, date: '2023-02-01', description: '檢查設備' },
  { id: 3, deviceId: 1, date: '2023-03-01', description: '清潔設備' },
  { id: 4, deviceId: 1, date: '2023-04-01', description: '更新軟體' },
  { id: 5, deviceId: 1, date: '2023-05-01', description: '更換零件' },
  { id: 6, deviceId: 2, date: '2023-01-01', description: '檢查設備' },
  { id: 7, deviceId: 2, date: '2023-02-01', description: '清潔設備' },
  { id: 8, deviceId: 2, date: '2023-03-01', description: '更新軟體' },
  { id: 9, deviceId: 3, date: '2023-01-01', description: '更換零件' },
  { id: 10, deviceId: 3, date: '2023-02-01', description: '檢查設備' },
  // ...其他維護紀錄
];

let deviceDetails = {
  1: { '設備編號': '1', '廠牌及型號': 'Brand A Model A', '建置日期': '2021-01-01', '擺放位置': 'Location A', '規格': 'Specs A', '建置廠商': 'Vendor A', '維護廠商': 'Vendor S' },
  2: { '設備編號': '2', '廠牌及型號': 'Brand B Model B', '建置日期': '2021-02-01', '擺放位置': 'Location B', '規格': 'Specs B', '建置廠商': 'Vendor B', '維護廠商': 'Vendor S' },
  3: { '設備編號': '3', '廠牌及型號': 'Brand C Model C', '建置日期': '2021-03-01', '擺放位置': 'Location C', '規格': 'Specs C', '建置廠商': 'Vendor C', '維護廠商': 'Vendor S' },
  // ...其他設備的基本資訊
};

// 獲取所有區域
app.get('/api/areas', (req, res) => {
  res.json(areas);
});

// 獲取某區域的設備
app.get('/api/devices/:areaId', (req, res) => {
  const areaId = parseInt(req.params.areaId);
  const areaDevices = devices.filter(device => device.areaId === areaId);
  res.json(areaDevices);
});

// 獲取設備的基本資訊
app.get('/api/deviceDetails/:deviceId', (req, res) => {
  const deviceId = parseInt(req.params.deviceId);
  const details = deviceDetails[deviceId] || {};
  res.json(details);
});

// 獲取設備的維護紀錄
app.get('/api/maintenanceRecords/:deviceId', (req, res) => {
  const deviceId = parseInt(req.params.deviceId);
  const deviceRecords = maintenanceRecords.filter(record => record.deviceId === deviceId);
  res.json(deviceRecords);
});

// 獲取請求單類型列表
app.get('/api/requestTypes', (req, res) => {
  const requestTypes = ['報修單', '變更申請單'];
  res.json(requestTypes);
});

// 獲取報修單的欄位
app.get('/api/repairFormFields', (req, res) => {
  const repairFormFields = [
    { name: 'subject', label: '主旨', type: 'text', required: true },
    { name: 'description', label: '問題描述', type: 'textarea', required: true },
    { name: 'contactPerson', label: '聯絡人', type: 'text', required: true },
    { name: 'contactPhone', label: '聯絡電話', type: 'text', required: true }
  ];
  res.json(repairFormFields);
});

// 獲取表單欄位
app.get('/api/formFields/:typeId', (req, res) => {
  const typeId = parseInt(req.params.typeId);
  let formFields = [];
  if (typeId === 1) { // 報修單
    formFields = [
      { name: 'subject', label: '主旨', type: 'text', required: true },
      { name: 'description', label: '問題描述', type: 'textarea', required: true },
      { name: 'contactPerson', label: '聯絡人', type: 'text', required: true },
      { name: 'contactPhone', label: '聯絡電話', type: 'text', required: true }
    ];
  } else if (typeId === 2) { // 變更申請單
    formFields = [
      { name: 'subject', label: '主旨', type: 'text', required: true },
      { name: 'changeDetails', label: '變更細節', type: 'textarea', required: true },
      { name: 'requestedBy', label: '申請人', type: 'text', required: true },
      { name: 'approvalStatus', label: '審批狀態', type: 'text', required: true }
    ];
  }
  res.json(formFields);
});

// 提交請求單
app.post('/api/submitForm', (req, res) => {
  const { deviceId, formType, ...formData } = req.body;
  console.log(`提交的${formType}：設備 ${deviceId}，資料：`, formData);
  res.json({ success: true });
});

// 新增報修單
app.post('/api/maintenance', (req, res) => {
  const { deviceId, subject, description, contactPerson, contactPhone } = req.body;
  console.log(`報修單：設備 ${deviceId}，主旨：${subject}，描述：${description}，聯絡人：${contactPerson}，聯絡電話：${contactPhone}`);
  res.json({ success: true });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`伺服器正在運行於 http://localhost:${PORT}`);
});