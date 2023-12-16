import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Layout, Menu } from 'antd'
import { Footer, Header, Content } from 'antd/es/layout/layout'
import Title from 'antd/es/typography/Title'

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
      <body className={inter.className}>

        <Layout>
          <Header style={{ display: 'flex', alignItems: 'center' }}>
            <div className="demo-logo" />
            <Title style={{ color: "white", textAlign: "center", width: "100%" }} level={3}>jbegazo paginar</Title>
            {/* <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['2']}
              items={[]}
              style={{ flex: 1, minWidth: 0 }}
            /> */}
          </Header>
          <Content style={{ padding: '0 48px' }}>
            {/*             <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb> */}
            <div
              style={{
                background: "white",
                minHeight: "100vh",
                padding: "0px",
              }}
            >
              {children}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Ant Design ©2023 Created by Ant UED</Footer>
        </Layout>


      </body>
    </html>
  )
}
