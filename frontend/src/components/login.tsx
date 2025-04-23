import { post } from "../common/request";
import { Button, Flex, Input, message, Spin } from "antd";
import { useState } from "react";

interface LoginProps {
    // サインイン通知
    onSigned: () => void;
}

interface Sign {
    id?: string;
    user_id: string;
    email: string;
    password: string;
}

/**
 * ログインコンポーネント
 * @param {LoginProps} props - プロパティ
 * @return {JSX.Element} - ログインコンポーネント 
 */
export const LoginComponent = (props: LoginProps) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [sign, setSign] = useState<Sign>({
        id: "",
        user_id: "",
        email: "",
        password: "",
    });

    /**
     * サインイン処理
     * - サインインのためのAPIを呼び出し、トークンを取得してlocalStorageに保存する。
     * - 成功した場合はメッセージを表示し、失敗した場合はエラーメッセージを表示する。
     * 
     * @async
     * @function onSubmit
     * @returns {Promise<void>} - Promise
     */
    const onSubmit = async () => {
        setLoading(true);
        try {
            if (!sign.user_id || !sign.password) {
                throw new Error("user id または password が空です。");
            }

            const res = await post(`/public/user/signin`, sign);
            console.debug(res);

            const token = res.data.data.token;
            localStorage.setItem("token", token);
            // 親コンポネントに対し、サイン成功通知
            props.onSigned();

            messageApi.success("ログインに成功しました。");
        } catch (error) {
            console.error(error);
            messageApi.error("ログインに失敗しました。" + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex justify="center" align="center" style={{ height: "100vh" }}>
            <Spin spinning={loading}>
                <h3 style={{ fontSize: '0.9rem', color: 'gray' }}>HC業務効率化推進室</h3>
                <div style={{ minWidth: '50vw' }}>
                    {contextHolder}
                    <Input
                        style={{ marginBottom: 16 }}
                        onChange={(e) => {
                            setSign({ ...sign, user_id: e.target.value });
                        }}
                        placeholder="user id"
                    />
                    <Input.Password
                        style={{ marginBottom: 16 }}
                        onChange={(e) => {
                            setSign({ ...sign, password: e.target.value });
                        }}
                        onPressEnter={onSubmit}
                        placeholder="password"
                    />
                    <Button type="primary" block onClick={onSubmit}>
                        ログイン
                    </Button>
                </div>
            </Spin>
        </Flex>
    );
};

