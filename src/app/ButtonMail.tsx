"use client";
import { Button, Tooltip } from 'antd';
import React from 'react';
import swal from 'sweetalert';
import { MailOutlined } from '@ant-design/icons';

const ButtonMail = () => {
  return (
    <Tooltip title="Enviar por correo">
      <Button onClick={() => {
        swal("", "Esta función aún no está disponible.", "info");
      }} type="primary" shape="circle" icon={<MailOutlined />} />
    </Tooltip>
  )
}

export default ButtonMail