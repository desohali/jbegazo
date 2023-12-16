"use client";
import { Alert, Button, Col, Divider, Flex, FloatButton, Form, Input, InputNumber, Row, Select, Spin, Typography } from 'antd';
import * as React from 'react';
import swal from 'sweetalert';
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
import { FilePdfOutlined, DeleteOutlined } from '@ant-design/icons';
import Loading from './loading';



// Declara la variable global de la librería para que TypeScript no arroje errores
declare global {
  interface Window {
    pdfjsLib: any; // Puedes reemplazar 'any' con un tipo más específico si hay uno disponible
  }
}

const { Title } = Typography;

var canvas: any, ctx: any;
// Convertir el código hexadecimal a valores RGB
function hexToRgb(hex: string) {
  // Eliminar el # al inicio si está presente
  hex = hex.replace(/^#/, '');

  // Separar los componentes de RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return { r, g, b };
}
const getCoordinates = (width: number, height: number, position: string) => {
  let XY: any = { x: 0, y: 0 };
  switch (position) {
    case 'si':
      XY.x = 25;
      XY.y = height - 25;
      break;
    case 'sd':
      XY.x = width - 100;
      XY.y = height - 25;
      break;
    case 'ii':
      XY.x = 25;
      XY.y = 25;
      break;
    case 'id':
      XY.x = width - 100;
      XY.y = 25;
      break;
  }
  return XY;
};

const paginacion = () => {
  const [paginas, setPaginas] = React.useState<number>(0);
  const [isFile, setIsFile] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [loadingPage, setloadingPage] = React.useState<Boolean>(true);
  React.useEffect(() => {
    setloadingPage(false);
  }, []);

  const paginarPDF = (file: any) => {
    setLoading(true);
    setPaginas(0);

    const reader = new FileReader();
    reader.onload = async function (event: any) {
      const typedArray = new Uint8Array(event.target.result);
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts[form.getFieldValue("letra")]);

      const loadingTask = window.pdfjsLib.getDocument(typedArray);
      const pdf = await loadingTask.promise;

      let index = 1, numeroInicio = Number(form.getFieldValue("numeroInicio"));
      const arrayCeros = Array(pdf.numPages).fill(0);
      for (const cero of arrayCeros) {
        if (index < Number(form.getFieldValue("paginaInicio")) || index > Number(form.getFieldValue("paginaFinal"))) {
          index++;
          continue;
        }
        const pageNumber = index; // Número de página a mostrar
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;

        const imgData = canvas.toDataURL('image/png', 0.9);
        const pngImage = await pdfDoc.embedPng(imgData);
        const newPage = pdfDoc.addPage([viewport.width, viewport.height]);
        newPage.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: pngImage.width,
          height: pngImage.height,
        });

        const { x, y } = getCoordinates(pngImage.width, pngImage.height, form.getFieldValue("posicion"));
        const { r, g, b } = hexToRgb(form.getFieldValue("color"));
        newPage.drawText(`Página ${numeroInicio}`, {
          x,
          y,
          size: Number(form.getFieldValue("tamanio")),
          font,
          color: rgb(r, g, b)
        });

        setPaginas((n: number) => (n + 1));
        numeroInicio++;
        index++;
      }

      const pdfBytes = await pdfDoc.save();

      setLoading(false);
      // Mostrar el PDF paginado en el iframe
      const pdfViewer: any = document.getElementById('pdfViewer');
      /* const blob = new Blob([pdfBytes], { type: 'application/pdf' }); */
      // Guardar el PDF en un archivo
      const pdfFile = new File([pdfBytes], 'nombre-del-archivo.pdf', { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfFile);
      console.log('blobUrl', blobUrl)
      pdfViewer.src = blobUrl//`https://docs.google.com/viewer?url=${blobUrl}`;


    };
    reader.readAsArrayBuffer(file);
  };

  const refPdf = React.useRef<any>()
  const refCanvas = React.useRef<any>()

  React.useEffect(() => {

    canvas = document.querySelector("canvas")
    ctx = canvas?.getContext('2d');

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.min.js';
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';
      }
    };
    document.body.appendChild(script);

    return () => {
      // Realizar alguna limpieza si es necesario al desmontar el componente
      document.body.removeChild(script);
    };
  }, [canvas]);


  const onFinish = (values: any) => {

    if (!Boolean(refPdf.current?.files.length)) {
      swal("", "Primero debe cargar su archivo.pdf", "info");
      return;
    }
    paginarPDF(refPdf.current.files[0]);
  };


  const [form] = Form.useForm();

  if (loadingPage) return <Loading />;


  return (
    <React.Suspense fallback={<Loading />}>
      <Row gutter={16} style={{ padding: "0px 12px" }}>

        <Col className="gutter-row" xs={24} sm={24} md={12} lg={6}>
          <Form
            name="validate_other"
            form={form}
            onFinish={onFinish}
            initialValues={{
              numeroInicio: 1,
              paginaInicio: 1,
              paginaFinal: 1,
              posicion: "sd",
              letra: "Courier",
              tamanio: "12",
              color: "#000000"
            }}
            style={{ width: "100%" }}
            layout="vertical"
          >

            <Row gutter={16}>
              <Col className="gutter-row" xs={24} sm={24} md={24} lg={24}>
                <Title level={3}>Opciones para numerar páginas</Title>
                <Divider />
              </Col>
              <Col className="gutter-row" xs={24} sm={24} md={24} lg={24}>
                <Title style={{ marginBottom: "0px" }} level={5}>Páginas</Title>
                <Form.Item
                  style={{ width: "100%" }}
                  name="numeroInicio"
                >
                  <InputNumber style={{ width: "100%" }} addonBefore="Primer número" />
                </Form.Item>
              </Col>

              <Col className="gutter-row" xs={24} sm={24} md={24} lg={24}>
                <Title style={{ marginBottom: "0px" }} level={5}>¿Qué páginas quieres numerar?</Title>
              </Col>
              <Col className="gutter-row" xs={12} sm={12} md={12} lg={12}>
                <Form.Item
                  style={{ width: "100%" }}
                  name="paginaInicio"
                >
                  <InputNumber style={{ width: "100%" }} addonBefore="De la página" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" xs={12} sm={12} md={12} lg={12}>
                <Form.Item
                  style={{ width: "100%" }}
                  name="paginaFinal"
                >
                  <InputNumber style={{ width: "100%" }} addonBefore="a la página" />
                </Form.Item>
              </Col>

              <Col className="gutter-row" xs={24} sm={24} md={24} lg={12}>
                <Title style={{ marginBottom: "0px" }} level={5}>Posición</Title>
                <Form.Item
                  style={{ width: "100%" }}
                  name="posicion"
                >
                  <Select style={{ width: "100%" }} options={[
                    { label: "Superior izquierdo", value: "si" },
                    { label: "Superior derecho", value: "sd" },
                    { label: "Inferior izquierdo", value: "ii" },
                    { label: "Inferior derecho", value: "id" },
                  ]} />
                </Form.Item>
              </Col>
              <Col className="gutter-row" xs={24} sm={24} md={24} lg={12}>
                <Title style={{ marginBottom: "0px" }} level={5}>Letra</Title>
                <Form.Item
                  style={{ width: "100%" }}
                  name="letra"
                >
                  <Select style={{ width: "100%" }} options={Object.keys(StandardFonts).map((font: string) => ({ label: font, value: font }))} />
                </Form.Item>
              </Col>

              <Col className="gutter-row" xs={12} sm={12} md={12} lg={12}>
                <Title style={{ marginBottom: "0px" }} level={5}>Tamaño</Title>
                <Form.Item
                  style={{ width: "100%" }}
                  name="tamanio"
                >
                  <Select style={{ width: "100%" }} options={[
                    { label: "12", value: "12" },
                    { label: "14", value: "14" },
                    { label: "16", value: "16" },
                    { label: "18", value: "18" },
                    { label: "20", value: "20" },
                    { label: "22", value: "22" },
                    { label: "24", value: "24" },
                  ]} />
                </Form.Item>
              </Col>
              <Col className="gutter-row" xs={12} sm={12} md={12} lg={12}>
                <Title style={{ marginBottom: "0px" }} level={5}>Color</Title>
                <Form.Item
                  style={{ width: "100%" }}
                  name="color"
                >
                  <Input type='color' placeholder="1N° ganador" style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Flex vertical gap="small" style={{ width: '100%', margin: "auto" }}>
                  <Button disabled={!isFile} loading={loading} icon={<FilePdfOutlined />} type="primary" block htmlType="submit">
                    Paginar pdf
                  </Button>
                </Flex>

                {loading && <Spin tip={`Enumerando ${paginas} páginas`}>
                  <Alert
                    message="..."
                    description="..."
                    type="info"
                  />
                </Spin>}
              </Col>

            </Row>

          </Form>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={18}>
          <div style={{ width: "100%", position: "relative" }}>
            <FloatButton tooltip={<div>Cargar su archivo.pdf</div>} style={{ top: "24px", left: "24px", position: "absolute" }} onClick={() => {
              refPdf.current.click();
            }} />
            {isFile && <FloatButton icon={<DeleteOutlined />} tooltip={<div>Borrar su archivo.pdf</div>} style={{ top: "72px", left: "24px", position: "absolute" }} onClick={() => {
              setIsFile(false);
              form.resetFields();
              refPdf.current.value = '';
              (document.getElementById("pdfViewer") as HTMLIFrameElement).src = "";
            }} />}

            <input style={{ display: "none" }} type="file" ref={refPdf} accept=".pdf" onChange={(e: any) => {

              const [file] = e.target.files;
              if (file) {
                setIsFile(true);
              }
              const reader = new FileReader();
              reader.onload = async function (event: any) {
                const typedArray = new Uint8Array(event.target.result);

                const pdfDoc = await PDFDocument.load(typedArray);
                form.setFieldsValue({ paginaFinal: pdfDoc.getPageCount() });
                const pdfBytes = await pdfDoc.save();

                // Mostrar el PDF paginado en el iframe
                const pdfViewer: any = document.getElementById('pdfViewer');
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                pdfViewer.src = blobUrl;

              };
              reader.readAsArrayBuffer(file);
            }} />
            <canvas ref={refCanvas} style={{ width: "100%", display: "none" }}></canvas>
          </div>

          <div style={{ width: "100%", height: "100vh" }}>
            <iframe id="pdfViewer" width="100%" height="100%"></iframe>
          </div>


        </Col>

      </Row>
    </React.Suspense>
  )
}

export default paginacion