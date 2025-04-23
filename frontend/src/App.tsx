import './App.css'
import { Tabs } from 'antd'
import { MailComponent } from './components/mail'
import { LoginComponent } from './components/login'
import { useEffect, useState } from 'react'
import { MeetComponent } from './components/meeting'
import { IntegrityComponent } from './components/integrity'
import { get } from './common/request'

function App() {
  const [isAuth, setIsAuth] = useState(false)

  const onSigned = () => {
    setIsAuth(true)
  }

  useEffect(() => {
    const checkAuth = async () => {
      // トークンの有無を確認
      const token = localStorage.getItem('token')
      if (token) {
        // トークンがある場合は認証済みとする
        try {
          // /api/private/healthにアクセスしてみる
          const res = await get('/private/health')
          if (res.status !== 200) {
            // ステータスコードが200でない場合は認証されていないとする
            throw new Error('認証されていません')
          }

          setIsAuth(true)
        } catch (error) {
          // エラーが発生した場合は認証されていないとする
          setIsAuth(false)
          return
        }
      } else {
        // トークンがない場合は認証されていないとする
        setIsAuth(false)
      }
    }

    checkAuth()
      .then(() => {
        console.debug('認証チェック完了', isAuth)
      })
      .catch((error: any) => {
        console.error('認証チェックエラー', error)
      })
  }, [])


  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, background: '#fff' }}>
      {
        !isAuth ? (
          <LoginComponent onSigned={onSigned} />
        ) : (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                label: `メール`,
                key: '1',
                children: <MailComponent />,
              },
              {
                label: `議事録`,
                key: '2',
                children: <MeetComponent />,
              },
              {
                label: `整合性チェック`,
                key: '3',
                children: <IntegrityComponent />,
              }
            ]}
          />
        )
      }
    </div>
  )
}

export default App
