import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Button, Layout, Menu, Tooltip } from 'antd'
import { Footer, Header, Content } from 'antd/es/layout/layout'
import Title from 'antd/es/typography/Title'
import ButtonMail from './ButtonMail'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jbegazo App',
  description: 'Jbegazo, es una app para numerar paginas de un archivo pdf',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <meta name="theme-color" content="#212529" />
      <body className={inter.className}>

        <Layout>
          <Header style={{ display: 'flex', alignItems: 'center', background: "#212529" }}>
            <div className="demo-logo" />
            <ButtonMail />
            <Title style={{ color: "white", textAlign: "center", width: "100%" }} level={3}>jbegazo paginar</Title>
            {/* <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['2']}
              items={[]}
              style={{ flex: 1, minWidth: 0 }}
            /> */}
          </Header>
          <Content style={{ padding: '0 12px' }}>
            {/*             <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb> */}
            <div
              style={{
                background: "white",
                minHeight: "80vh",
                padding: "0px",
              }}
            >
              {children}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            <Title style={{ padding: "0px", margin: "0px" }} level={5}>Copyright ©2023 | Jbegazo-paginar</Title>
            <Title style={{ padding: "0px", margin: "0px" }} level={5}>
              Todos los derechos reservados. Aplicación desarrollada por Robinson Alonso Jimenez Begazo.
            </Title>
          </Footer>
        </Layout>


      </body>
    </html>
  )
}
