"use client";
import { Alert, Button, Col, Divider, Flex, FloatButton, Form, Input, InputNumber, Progress, Row, Select, Spin, Switch, Typography } from 'antd';
import * as React from 'react';
import swal from 'sweetalert';
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
import { FilePdfOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import Loading from './loading';
import { degrees } from 'pdf-lib';


// Declara la variable global de la librería para que TypeScript no arroje errores
declare global {
  interface Window {
    pdfjsLib: any; // Puedes reemplazar 'any' con un tipo más específico si hay uno disponible
  }
}

const { Title, Text } = Typography;

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
const getCoordinates = (width: number, height: number, position: string, { font, text, fontSize }: any) => {
  let XY: any = { x: 0, y: 0 }, textWidth;
  switch (position) {
    case 'si':
      XY.x = 15;
      XY.y = height - 15;
      break;
    case 'sd':
      textWidth = font.widthOfTextAtSize(text, fontSize);
      XY.x = width - (textWidth + 15);
      XY.y = height - 15;
      break;
    case 'ii':
      XY.x = 15;
      XY.y = 15;
      break;
    case 'id':
      textWidth = font.widthOfTextAtSize(text, fontSize);
      XY.x = width - (textWidth + 15);
      XY.y = 15;
      break;
  }
  return XY;
};

const numeroEnLetras = (numero: number): string => {
  const unidades = [
    'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'
  ];

  const decenas = [
    '', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'
  ];

  const centenas = [
    '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'
  ];

  if (numero >= 0 && numero <= 19) {
    return unidades[numero];
  } else if (numero >= 20 && numero <= 99) {
    const decena = Math.floor(numero / 10);
    const unidad = numero % 10;
    if (unidad === 0) {
      return decenas[decena];
    } else {
      return decenas[decena] + ' y ' + unidades[unidad];
    }
  } else if (numero >= 100 && numero <= 999) {
    const centena = Math.floor(numero / 100);
    const resto = numero % 100;
    if (resto === 0) {
      return centenas[centena];
    } else {
      return centenas[centena] + ' ' + numeroEnLetras(resto);
    }
  } else if (numero === 1000) {
    return 'mil';
  } else if (numero > 1000 && numero <= 19999) {
    const mil = Math.floor(numero / 1000);
    const resto = numero % 1000;
    if (resto === 0) {
      return unidades[mil] + ' mil';
    } else {
      return unidades[mil] + ' mil ' + numeroEnLetras(resto);
    }
  } else {
    return 'Número fuera del rango soportado';
  }
};

function primeraLetraMayuscula(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}


const paginacion = () => {
  const [paginas, setPaginas] = React.useState<number>(0);
  const [percentage, setPercentage] = React.useState<number>(0);
  const [file, setFile] = React.useState<any>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingFile, setLoadingFile] = React.useState<boolean>(false);
  const [loadingFoliar, setLoadingFoliar] = React.useState<boolean>(false);
  const [loadingPage, setloadingPage] = React.useState<Boolean>(true);
  React.useEffect(() => {
    setloadingPage(false);
  }, []);

  const subirPdf = (file: any) => {
    setLoadingFile(true);
    setLoadingFoliar(true);
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = Math.round((event.loaded / event.total) * 100);
        setPercentage(percentLoaded);
      }
    };
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
  };

  const paginarPDF = (file: any) => {
    setLoading(true);
    setPaginas(0);
    const reader = new FileReader();
    reader.onload = async function (event: any) {

      const typedArray = new Uint8Array(event.target.result);


      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts[form.getFieldValue("letra")]);
      const filePDF = await PDFDocument.load(typedArray);
      ////////////////////////////////////////////////////////////////////////////////
      const pdfDocHeader = await PDFDocument.create();
      /* const pdfDocBody = await PDFDocument.create(); */
      const pdfDocFooter = await PDFDocument.create();
      const [paginaInicio, paginaFinal] = [
        Number(form.getFieldValue("paginaInicio")),
        Number(form.getFieldValue("paginaFinal"))
      ];

      let index = 1, numeroInicio = input ?
        (Number(form.getFieldValue("numeroInicio")) + (paginaFinal - paginaInicio)) :
        Number(form.getFieldValue("numeroInicio"));

      if (paginaInicio > 1) {
        // Copia las páginas del documento original al nuevo documento
        const pageIndicesToCopy = Array.from({ length: (paginaInicio - 1) }, (_, index) => index);
        const copiedPages = await pdfDocHeader.copyPages(filePDF, pageIndicesToCopy);

        copiedPages.forEach((page: any) => {
          pdfDocHeader.addPage(page);
        });
      }

      if (paginaFinal < filePDF.getPages().length) {
        // Copia las páginas del documento original al nuevo documento
        const pageIndicesToCopy = Array.from({ length: (filePDF.getPages().length - paginaFinal) }, (_, index) => (paginaFinal + index));
        const copiedPages = await pdfDocFooter.copyPages(filePDF, pageIndicesToCopy);

        copiedPages.forEach((page: any) => {
          pdfDocFooter.addPage(page);
        });
      }
      ////////////////////////////////////////////////////////////////////////////////

      let page;
      for (const p of filePDF.getPages()) {
        if (index < paginaInicio || index > paginaFinal) {
          index++;
          continue;
        }
        const { x, y, width, height } = p.getMediaBox();
        const { r, g, b } = hexToRgb(form.getFieldValue("color"));
        const text = `${form.getFieldValue("abreviatura")} ${numeroInicio}-${primeraLetraMayuscula(numeroEnLetras(numeroInicio))}`.trim();

        if (p.getRotation().angle === 180) {
          const preamble = await pdfDoc.embedPage(p, {
            left: 0,
            bottom: 0,
            right: width + x,
            top: height + y,
          });

          const preambleDims = preamble.scale(1);
          page = pdfDoc.addPage([width, height]);
          page.drawPage(preamble, {
            ...preambleDims,
            x: width + x,
            y: height + y,
            rotate: degrees(p.getRotation().angle)
          });
          const { x: xx, y: yy } = getCoordinates(
            width,
            height,
            form.getFieldValue("posicion"),
            {
              font,
              text,
              fontSize: Number(form.getFieldValue("tamanio"))
            });
          page.drawText(text, {
            x: xx,
            y: yy,
            size: Number(form.getFieldValue("tamanio")),
            font,
            color: rgb(r, g, b)
          });

        } else if (p.getRotation().angle === 0) {
          const preamble = await pdfDoc.embedPage(p, {
            left: 0,
            bottom: 0,
            right: width + x,
            top: height + y,
          });

          const preambleDims = preamble.scale(1);
          page = pdfDoc.addPage([width, height]);
          page.drawPage(preamble, {
            ...preambleDims,
            x: -x,
            y: -y,
            rotate: degrees(p.getRotation().angle)
          });
          const { x: xx, y: yy } = getCoordinates(
            width,
            height,
            form.getFieldValue("posicion"),
            {
              font,
              text,
              fontSize: Number(form.getFieldValue("tamanio"))
            });
          page.drawText(text, {
            x: xx,
            y: yy,
            size: Number(form.getFieldValue("tamanio")),
            font,
            color: rgb(r, g, b)
          });
        } else if (p.getRotation().angle === 270) {
          p.setRotation(degrees(0));
          const { x, y, width, height } = p.getMediaBox()
          const preamble = await pdfDoc.embedPage(p, {
            left: 0,
            bottom: 0,
            right: width,
            top: height,
          });

          const preambleDims = preamble.scale(1);
          page = pdfDoc.addPage([height, width]);
          page.drawPage(preamble, {
            ...preambleDims,
            x: height + y,
            y: 0,
            rotate: degrees(90)
          });
          const { x: xx, y: yy } = getCoordinates(
            height,
            width,
            form.getFieldValue("posicion"),
            {
              font,
              text,
              fontSize: Number(form.getFieldValue("tamanio"))
            });
          page.drawText(text, {
            x: xx,
            y: yy,
            size: Number(form.getFieldValue("tamanio")),
            font,
            color: rgb(r, g, b)
          });
        }

        setPaginas((n: number) => (n + 1));

        if (input) {
          numeroInicio--;
        } else {
          numeroInicio++;
        }
        index++;
      }


      const mergedPdfDoc = await PDFDocument.create();
      const pagesFromPdf1 = await mergedPdfDoc.copyPages(pdfDocHeader, pdfDocHeader.getPageIndices());
      pagesFromPdf1.forEach((page: any) => {
        mergedPdfDoc.addPage(page);
      });
      const pagesFromPdf2 = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pagesFromPdf2.forEach((page: any) => {
        mergedPdfDoc.addPage(page);
      });
      const pagesFromPdf3 = await mergedPdfDoc.copyPages(pdfDocFooter, pdfDocFooter.getPageIndices());
      pagesFromPdf3.forEach((page: any) => {
        mergedPdfDoc.addPage(page);
      });

      const pdfBytes = await mergedPdfDoc.save();


      setLoading(false);
      // Mostrar el PDF paginado en el iframe
      const pdfViewer: any = document.getElementById('pdfViewer');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      // Guardar el PDF en un archivo
      const blobUrl = URL.createObjectURL(blob);
      pdfViewer.src = blobUrl;//`https://docs.google.com/viewer?url=${blobUrl}`;



      /* // Crear un enlace para descargar el PDF
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      const [file] = refPdf.current.files;
      downloadLink.download = file.name; // Nombre del archivo que se descargará

      // Agregar el enlace al cuerpo del documento
      document.body.appendChild(downloadLink);

      // Simular clic en el enlace para descargar automáticamente
      downloadLink.click();

      // Eliminar el enlace después de un breve retraso (por ejemplo, 2 segundos)
      setTimeout(() => {
        document.body.removeChild(downloadLink);
      }, 1000); */


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
  const [input, setInput] = React.useState(false);
  if (loadingPage) return <Loading />;


  return (
    <React.Suspense fallback={<Loading />}>
      <Row gutter={16} style={{ padding: "0px 12px" }}>

        <Col className="gutter-row" xs={24} sm={24} md={12} lg={6}>
          <Alert
            style={{ margin: "1rem 0rem" }}
            message="Peso máximo permitido 25mb"
            type={(file && file.mb <= 25) ? "success" : "warning"} showIcon />

          <Flex vertical gap="small" style={{ width: '100%', marginBottom: "1rem" }}>
            <Button onClick={() => {
              refPdf.current.click();
            }} icon={<FilePdfOutlined />} type="primary" style={{ background: "#212529" }} block>
              Seleccionar pdf
            </Button>
          </Flex>
          {file && <Alert
            style={{ marginBottom: "1rem" }}
            message={(file.mb <= 25) ? "El archivo esta listo para subir" : "El archivo supera los 25mb permitidos"}
            description={(
              <>
                <Text>Nombre : {file.name}</Text>
                <br />
                <Text>Peso : {file.mb} mb</Text>
              </>
            )}
            type={(file.mb <= 25) ? "success" : "error"}
            showIcon
          />}

          {loadingFile && <Progress percent={percentage} />}
          {file && <Flex vertical gap="small" style={{ width: '100%', marginBottom: "1rem" }}>
            <Button disabled={!file} onClick={() => {
              const [file] = refPdf.current.files;
              subirPdf(file);
            }} icon={<UploadOutlined />} type="primary" style={{ background: "#212529" }} block>
              Subir pdf
            </Button>
          </Flex>}

        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={12} lg={18}>

          <div style={{ width: "100%", display: !loadingFoliar ? "none" : "" }}>
            <Alert
              style={{ margin: "1rem 0rem" }}
              message="El archivo pdf está listo para ser foliado"
              type={(file && file.mb <= 25) ? "success" : "warning"} showIcon />
            <Form
              name="validate_other"
              form={form}
              onFinish={onFinish}
              initialValues={{
                numeroInicio: 1,
                paginaInicio: 1,
                paginaFinal: 1,
                posicion: "id",
                letra: "CourierBold",
                tamanio: "18",
                color: "#000000",
                abreviatura: "",
                reverse: false
              }}
              style={{ width: "100%" }}
              layout="horizontal"
            >

              <Row gutter={16} style={{ margin: "1rem 0rem" }}>

                <Col className="gutter-row" xs={12} sm={12} md={8} lg={8}>
                  <Form.Item
                    style={{ width: "100%" }}
                    name="paginaInicio"
                    label="Página inicio"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" xs={12} sm={12} md={8} lg={8}>
                  <Form.Item
                    style={{ width: "100%" }}
                    name="paginaFinal"
                    label="Página final"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" xs={24} sm={24} md={8} lg={8}>
                  <Form.Item
                    style={{ width: "100%" }}
                    name="posicion"
                    label="Posición"
                  >
                    <Select style={{ width: "100%" }} options={[
                      { label: "Superior izquierdo", value: "si" },
                      { label: "Superior derecho", value: "sd" },
                      { label: "Inferior izquierdo", value: "ii" },
                      { label: "Inferior derecho", value: "id" },
                    ]} />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" xs={24} sm={24} md={8} lg={8}>
                  <Form.Item
                    style={{ width: "100%" }}
                    name="letra"
                    label="Tipo letra"
                  >
                    <Select style={{ width: "100%" }} options={Object.keys(StandardFonts).map((font: string) => ({ label: font, value: font }))} />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" xs={12} sm={12} md={8} lg={8}>
                  <Form.Item
                    style={{ width: "100%" }}
                    name="tamanio"
                    label="Tamaño letra"
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
                <Col className="gutter-row" xs={12} sm={12} md={8} lg={8}>
                  <Form.Item
                    style={{ width: "100%" }}
                    name="color"
                    label="Color letra"
                  >
                    <Input type='color' placeholder="1N° ganador" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" xs={12} sm={12} md={8} lg={8}>
                  <Form.Item
                    style={{ width: "100%" }}
                    name="numeroInicio"
                    label="Primer número"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" xs={12} sm={12} md={8} lg={8}>
                  <Form.Item
                    style={{ width: "100%" }}
                    name="abreviatura"
                    label="Abreviatura"
                  >
                    <Input style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" xs={12} sm={12} md={8} lg={8}>
                  <Form.Item
                    style={{ width: "100%" }}
                    name="reverse"
                    label="Reverso"
                  >
                    <Switch checked={input} onChange={() => {
                      setInput(!input)
                    }} />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" xs={24} sm={24} md={8} lg={8}>
                </Col>
                <Col span={24}>
                  <Flex vertical gap="small" style={{ width: '50%', margin: "auto" }}>
                    <Button loading={loading} icon={<FilePdfOutlined />} style={{ background: "#212529" }} type="primary" block htmlType="submit">
                      Foliar pdf
                    </Button>
                  </Flex>

                  {loading && <Spin tip={`Enumerando ${paginas} páginas`}>
                    <Alert
                      message="..."
                      description="..."
                      type="success"
                    />
                  </Spin>}
                </Col>

              </Row>

            </Form>
          </div>


          <div style={{ width: "100%", position: "relative", display: !loadingFoliar ? "none" : "" }}>
            {file && <FloatButton icon={<DeleteOutlined />} tooltip={<div>Borrar su archivo.pdf</div>} style={{ top: "72px", left: "24px", position: "absolute" }} onClick={() => {
              setFile(false);
              setLoadingFile(false);
              setLoadingFoliar(false);

              form.resetFields();
              refPdf.current.value = '';
              (document.getElementById("pdfViewer") as HTMLIFrameElement).src = "";
            }} />}

            <input style={{ display: "none" }} type="file" ref={refPdf} accept=".pdf" onChange={(e: any) => {
              const [file] = e.target.files;
              if (file) {
                // Convertir bytes a megabytes
                const fileSizeInMegabytes = (file.size / (1024 * 1024));
                setFile({ name: file.name, mb: fileSizeInMegabytes.toFixed(2) });
              }

            }} />
          </div>

          <div style={{ width: "100%", height: "100vh", display: !loadingFoliar ? "none" : "" }}>
            <iframe id="pdfViewer" width="100%" height="100%"></iframe>
          </div>


        </Col>

      </Row>
    </React.Suspense>
  )
}

export default paginacion