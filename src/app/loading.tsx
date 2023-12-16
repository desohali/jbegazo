"use client";
import React from 'react';
import { Spin } from 'antd';



const Loading = () => {

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin tip="CARGANDO..." size="large" />
    </div>
  );
};

export default Loading;