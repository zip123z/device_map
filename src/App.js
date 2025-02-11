import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [devices, setDevices] = useState([]);
  const [floorplan, setFloorplan] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceDetails, setDeviceDetails] = useState({});
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [repairForm, setRepairForm] = useState({
    subject: '',
    description: '',
    contactPerson: '',
    contactPhone: ''
  });
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [showMaintenanceRecords, setShowMaintenanceRecords] = useState(false);
  const [requestTypes, setRequestTypes] = useState([]);
  const [showRequestTypes, setShowRequestTypes] = useState(false);
  const [repairFormFields, setRepairFormFields] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [formTitle, setFormTitle] = useState('');

  // 獲取區域資料
  useEffect(() => {
    axios.get('http://localhost:5001/api/areas')
      .then(response => setAreas(response.data))
      .catch(error => console.error(error));
  }, []);

  // 切換區域
  const handleAreaChange = (e) => {
    const areaId = e.target.value;
    setSelectedArea(areaId);
    axios.get(`http://localhost:5001/api/devices/${areaId}`)
      .then(response => setDevices(response.data))
      .catch(error => console.error(error));
    
    // 獲取區域的平面圖
    const selectedAreaData = areas.find(area => area.id === parseInt(areaId));
    if (selectedAreaData) {
      setFloorplan(selectedAreaData.floorplans[0] || null);
    }
  };

  // 確保在區域資料獲取後更新 floorplan
  useEffect(() => {
    if (selectedArea) {
      const selectedAreaData = areas.find(area => area.id === parseInt(selectedArea));
      if (selectedAreaData) {
        setFloorplan(selectedAreaData.floorplans[0] || null);
      }
    }
  }, [areas, selectedArea]);

  // 確保在區域資料獲取後更新 devices
  useEffect(() => {
    if (selectedArea) {
      axios.get(`http://localhost:5001/api/devices/${selectedArea}`)
        .then(response => setDevices(response.data))
        .catch(error => console.error(error));
    }
  }, [selectedArea]);

  // 點擊設備點
  const handleDeviceClick = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    setSelectedDevice(device);
    setShowDeviceInfo(true);

    // 獲取設備的基本資料
    axios.get(`http://localhost:5001/api/deviceDetails/${deviceId}`)
      .then(response => {
        const deviceInfo = response.data;
        setDeviceDetails(deviceInfo);
        const deviceInfoCount = deviceInfo.length;
        setDeviceDetails(prevDetails => ({
        ...prevDetails,
        資料: deviceInfoCount || '待補充',
        }))
      })
      .catch(error => console.error(error));

    // 獲取設備的維護紀錄
    axios.get(`http://localhost:5001/api/maintenanceRecords/${deviceId}`)
      .then(response => {
        const records = response.data;
        setMaintenanceRecords(records);
        const maintenanceCount = records.length;
        const lastMaintenanceDate = records.length > 0 ? records.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : '無';
        setMaintenanceRecords(prevDetails => ({
          ...prevDetails,
          lastMaintenanceDate: lastMaintenanceDate || '無',
          maintenanceCount: maintenanceCount || 0
        }));
      })
      .catch(error => console.error(error));
  };

  // 提交報修單
  const handleRepairSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5001/api/maintenance', {
      deviceId: selectedDevice.id,
      ...repairForm
    })
      .then(response => {
        alert('報修單提交成功！');
        setShowRepairForm(false);
        setRepairForm({
          subject: '',
          description: '',
          contactPerson: '',
          contactPhone: ''
        });
      })
      .catch(error => console.error(error));
  };

  // 獲取維護紀錄
  const handleMaintenanceCountClick = () => {
    axios.get(`http://localhost:5001/api/maintenanceRecords/${selectedDevice.id}`)
      .then(response => {
        setMaintenanceRecords(response.data);
        setShowMaintenanceRecords(true);
      })
      .catch(error => console.error(error));
  };

  // 點擊開立請求單按鈕
  const handleOpenRequestForm = () => {
    axios.get('http://localhost:5001/api/requestTypes')
      .then(response => {
        setRequestTypes(response.data);
        setShowRequestTypes(true);
      })
      .catch(error => console.error(error));
  };

  // 點擊請求單類型
  const handleRequestTypeClick = (type) => {
    const typeId = type === '報修單' ? 1 : 2; // 假設報修單的 ID 為 1，變更申請單的 ID 為 2
    axios.get(`http://localhost:5001/api/formFields/${typeId}`)
      .then(response => {
        setFormFields(response.data);
        setFormTitle(type); // 設置表格標題
        setShowRepairForm(true);
      })
      .catch(error => console.error(error));
    setShowRequestTypes(false);
  };

  // 提交請求單
  const handleFormSubmit = (e) => {
    e.preventDefault();
    axios.post(`http://localhost:5001/api/submitForm`, {
      deviceId: selectedDevice.id,
      formType: formTitle,
      ...repairForm
    })
      .then(response => {
        alert('請求單提交成功！');
        setShowRepairForm(false);
        setRepairForm({
          subject: '',
          description: '',
          contactPerson: '',
          contactPhone: ''
        });
      })
      .catch(error => console.error(error));
  };

  return (
    <div className="App">
      <h1>顯示器維護系統</h1>
      <div>
        <label>選擇區域：</label>
        <select onChange={handleAreaChange}>
          <option value="">請選擇</option>
          {areas.map(area => (
            <option key={area.id} value={area.id}>{area.name}</option>
          ))}
        </select>
      </div>
      {floorplan && (
        <div style={{ width: '100%', marginTop: '20px', position: 'relative' }}>
          <img src={floorplan} alt="Floorplan" style={{ width: '100%' }} />
          {devices.map(device => (
            <div
              key={device.id}
              style={{
                position: 'absolute',
                top: `${device.y * 100 / 662}%`,
                left: `${device.x * 100 / 1316}%`,
                width: '20px',
                height: '20px',
                backgroundColor: 'red',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer'
              }}
              title={device.type}
              onClick={() => handleDeviceClick(device.id)}
            />
          ))}
        </div>
      )}
      {showDeviceInfo && selectedDevice && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowDeviceInfo(false)}>&times;</span>
            <div className="device-info">
              <div className="device-details">
                <h2>設備基本資訊</h2>
                {Object.entries(deviceDetails).map(([key, value]) => (
                  <p key={key}><strong>{key}：</strong>{value}</p>
                ))}
              </div>
              <div className="maintenance-history">
                <h3>維護歷程紀錄</h3>
                <p><strong>最近維護日期：</strong>{maintenanceRecords.lastMaintenanceDate}</p>
                <p><strong>維修次數：</strong><span className="link" onClick={handleMaintenanceCountClick}>{maintenanceRecords.maintenanceCount}</span></p>
                <button onClick={handleOpenRequestForm}>開立請求單</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showRequestTypes && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowRequestTypes(false)}>&times;</span>
            <h2>選擇請求單類型</h2>
            <div>
              {requestTypes.map(type => (
                <button key={type} className="link" onClick={() => handleRequestTypeClick(type)}>{type}</button>
              ))}
            </div>
          </div>
        </div>
      )}
      {showMaintenanceRecords && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowMaintenanceRecords(false)}>&times;</span>
            <h3>相關請求單</h3>
            <div className="maintenance-records">
              {maintenanceRecords.map(record => (
                <div key={record.id} className="maintenance-card">
                  <p><strong>日期：</strong>{record.date}</p>
                  <p><strong>描述：</strong>{record.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showRepairForm && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowRepairForm(false)}>&times;</span>
            <h2>{formTitle}</h2> {/* 動態設置表格標題 */}
            <form onSubmit={handleFormSubmit}>
              {formFields.map(field => (
                <div key={field.name}>
                  <label>{field.label}：</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={repairForm[field.name]}
                      onChange={(e) => setRepairForm({ ...repairForm, [field.name]: e.target.value })}
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={repairForm[field.name]}
                      onChange={(e) => setRepairForm({ ...repairForm, [field.name]: e.target.value })}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <button type="submit">提交</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;