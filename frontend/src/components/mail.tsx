import { message, Spin, Typography, Input, Space, Drawer, Row, Col, Button } from 'antd';
import { post } from '../common/request';
import { useState } from 'react';

import { BulbOutlined } from '@ant-design/icons';

const functionName = 'メールリファクタリング';
const initialContent = 'メールの内容を入力してください。';

export const MailComponent = () => {
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [baseMail, setBaseMail] = useState('');

    const [model, setModel] = useState('');
    const [result, setResult] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);

    const send = async () => {
        if (baseMail.trim() === '') {
            messageApi.error('メールの内容を入力してください。');
            return;
        }

        setLoading(true);
        try {
            const path = '/private/ai/gemini/mail';
            const data = {
                message: baseMail,
            };
            const response = await post(path, data);
            if (response.status === 200) {
                setResult(response.data);
                messageApi.success(functionName + 'に成功しました');
                let data = response.data.data;
                console.debug(functionName + '結果:');
                console.debug(data);

                setModel(data.model);
                setResult(data.result);
                setElapsedTime(data.elapsed);

                setBaseMail('');
            } else {
                throw new Error(functionName + `に失敗しました: ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error sending request:', error);
            messageApi.error(functionName + '中にエラーが発生しました。');
        } finally {
            setLoading(false);
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };

    const dismissModal = () => {
        setIsModalOpen(false);
    }

    return (
        <div style={{ padding: '2rem' }}>
            {contextHolder}
            <DrawerContent isModalOpen={isModalOpen} dismissModal={dismissModal} />
            {result ? (
                <Row style={{ marginTop: '2rem' }}>
                    <Col span={24}>
                        <Row>
                            <Col span={24}>

                                <div dangerouslySetInnerHTML={{ __html: `output model: ${model}, elapsed: ${elapsedTime}秒<br/><br/>${result}` }} style={{
                                    borderRadius: 4,
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    maxHeight: '50vh',
                                    overflowY: 'auto',
                                    textAlign: 'left',
                                }} />
                            </Col>
                        </Row>
                    </Col >
                </Row >) : <p>{initialContent}</p>}

            <Spin spinning={loading}>
                <Space size={'large'} direction='vertical' style={{ width: '100%' }}>
                    <Row>
                        <Col span={24} style={{ textAlign: 'right' }}>
                            {/* 右端固定 */}
                            <Button type='text' onClick={showModal}>
                                <BulbOutlined style={{ color: 'orange' }} />
                            </Button>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Space size={'large'} direction='vertical' style={{ width: '100%' }}>
                                <Input.TextArea
                                    value={baseMail}
                                    onChange={(e) => setBaseMail(e.target.value)}
                                    placeholder="Enter your message here..."
                                    rows={6}
                                />
                                <Button
                                    type="primary"
                                    onClick={send}
                                >
                                    {functionName}
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Space>
            </Spin >
        </div>
    );
};

interface DrawerContentProps {
    isModalOpen: boolean;
    dismissModal: () => void;
}

const DrawerContent = (props: DrawerContentProps) => {
    return (
        <Drawer
            title="メール文章をリファクタリング"
            placement="right"
            closable={false}
            onClose={props.dismissModal}
            open={props.isModalOpen}
        >
            <Typography.Title level={4}>AIによる社外クライアント向けメールのチェック・リファクタリング指示</Typography.Title>

            <Typography.Title level={5}>あなたの役割 (AI Role)</Typography.Title>
            <Typography.Paragraph>
                あなたは、経験豊富なビジネスコミュニケーションコンサルタントです。特に社外クライアントとの円滑かつ効果的なメールコミュニケーションを専門としています。丁寧さ、明確さ、戦略性を重視し、受け手に好印象を与え、ビジネス目標の達成に貢献するメールを作成するスキルを持っています。
            </Typography.Paragraph>

            <Typography.Title level={5}>目的 (Goal)</Typography.Title>
            <Typography.Paragraph>
                以下の「元のメール文章」を、社外クライアント向けのコミュニケーション・ビジネスメールとして最高品質のレベルにリファクタリングしてください。単なる修正だけでなく、より効果的で洗練されたコミュニケーションを実現するための改善提案も期待します。
            </Typography.Paragraph>

            <Typography.Title level={5}>推測される背景情報 (Inferred Context - AIが抽出)</Typography.Title>
            <Typography.Paragraph>
                ※ <b>元のメール文章から読み解き</b>、以下の項目を<b>可能な限り推測</b>してください。<b>推測が困難な場合や情報が不足している場合は、最も一般的で丁寧さが求められるビジネスシーン（例：既存クライアントへの標準的な連絡、トーンは標準的ビジネス）を想定</b>してください。
            </Typography.Paragraph>
            <ul>
                <li><b>メールの主な目的:</b> (例: アポイントメント依頼、製品紹介、問い合わせへの回答、お礼、謝罪、進捗報告、提案、見積もり送付など)</li>
                <li><b>クライアントとの関係性:</b> (例: 新規、既存（取引期間短い）、既存（長年の付き合い）、潜在顧客など)</li>
                <li><b>緊急度・重要度:</b> (例: 高・中・低)</li>
                <li><b>特に伝えたい/強調したい点:</b></li>
                <li><b>想定されるべきトーン:</b> (例: 非常に丁寧、標準的ビジネス、やや親しみやすく、緊急性を出す など)</li>
                <li><b>その他特記事項:</b> (例: 過去の経緯、避けるべき表現、含めるべき必須情報など)</li>
            </ul>

            <Typography.Title level={5}>元のメール文章 (Original Email Text)</Typography.Title>
            <Typography.Paragraph>
                <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 4 }}>{ }</pre>
            </Typography.Paragraph>

            <Typography.Title level={5}>リファクタリングの際の品質基準 & チェック項目 (Quality Standards & Checklist)</Typography.Title>
            <Typography.Paragraph>
                <b>上記で推測した背景情報を踏まえ</b>、以下の全ての基準を満たすように、元のメール文章をチェックし、必要に応じてリファクタリングしてください。
            </Typography.Paragraph>
            <ol>
                <li>
                    <b>目的の明確性:</b>
                    <ul>
                        <li>メールの目的（何をしてほしいのか、何を伝えたいのか）が一読して明確に理解できるか？</li>
                        <li>主題（Subject/件名）は具体的で分かりやすいか？</li>
                    </ul>
                </li>
                <li>
                    <b>正確性:</b>
                    <ul>
                        <li>誤字脱字、文法的な誤りがないか？</li>
                        <li>固有名詞（社名、氏名、製品名など）、日付、数値に間違いはないか？</li>
                    </ul>
                </li>
                <li>
                    <b>明瞭性・誤解防止:</b>
                    <ul>
                        <li>専門用語や略語が不必要に使われていないか？（必要な場合は注釈があるか？）</li>
                        <li>曖昧な表現や多義的な表現がなく、一意に解釈できるか？</li>
                        <li>一文が長すぎず、簡潔か？</li>
                    </ul>
                </li>
                <li>
                    <b>丁寧さ・礼儀正しさ:</b>
                    <ul>
                        <li>クライアントに対する敬意が示されており、適切な敬語（尊敬語・謙譲語・丁寧語）が使われているか？</li>
                        <li>クッション言葉が効果的に使われているか？</li>
                        <li>高圧的、一方的な印象を与えないか？</li>
                        <li>（推測した）クライアントとの関係性に応じた適切な丁寧さか？</li>
                    </ul>
                </li>
                <li>
                    <b>構成・論理性:</b>
                    <ul>
                        <li>文章全体の流れ（挨拶→本題→結び）が自然で論理的か？</li>
                        <li>情報の提示順序は適切か？</li>
                        <li>段落分けは適切に行われているか？</li>
                        <li>接続詞は効果的に使われているか？</li>
                    </ul>
                </li>
                <li>
                    <b>情報網羅性・強調:</b>
                    <ul>
                        <li>伝えるべき重要な情報（5W1Hなど）に漏れはないか？</li>
                        <li>特に重要な情報は、箇条書きや太字などで適切に強調されているか？（過度な強調は避ける）</li>
                        <li>次のアクション（返信依頼、資料確認依頼など）が必要な場合、それが明確に示されているか？</li>
                    </ul>
                </li>
                <li>
                    <b>語彙・表現:</b>
                    <ul>
                        <li>ビジネスシーンにふさわしい語彙が選択されているか？</li>
                        <li>定型的すぎず、かつ、相手に合わせた配慮が見られる表現か？</li>
                        <li>情報の整合性（本文と件名、添付ファイルとの整合性など）は取れているか？</li>
                    </ul>
                </li>
                <li>
                    <b>文章量:</b>
                    <ul>
                        <li>冗長な表現がなく、目的達成のために必要十分な長さか？</li>
                        <li>簡潔さと丁寧さのバランスは取れているか？</li>
                    </ul>
                </li>
                <li>
                    <b>推測背景との整合性:</b>
                    <ul>
                        <li>AI自身が推測した「背景情報」が、リファクタリング後の文章に矛盾なく反映されているか？</li>
                    </ul>
                </li>
            </ol>

            <Typography.Title level={5}>出力形式 (Output Format)</Typography.Title>
            <Typography.Paragraph>
                以下の形式で出力してください。
            </Typography.Paragraph>
            <ol>
                <li>
                    <b>リファクタリング後のメール文章:</b>
                    <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 4 }}>
                        件名：(リファクタリング後の件名)

                        (リファクタリング後の本文)
                    </pre>
                </li>
                <li>
                    <b>リファクタリングのポイント:</b> (どのような点を変更・修正したかの要約)
                </li>
                <li>
                    <b>リファクタリングの理由:</b> (各変更・修正が、上記の品質基準や<b>推測した背景情報</b>に基づいてなぜ必要だったかの具体的な説明。<b>推測した背景情報（目的、関係性、トーン等）についても言及すること。</b>)
                </li>
                <li>
                    <b>更なる改善提案・補足点:</b> (元の文章に不足していた情報、論理の弱さ、説明不足など、リファクタリングだけでは補いきれないが重要だと感じた点や、代替表現の提案など。<b>推測した背景情報の根拠や、もし実際の状況と異なる場合に特に注意すべき点についても言及すること。</b>)
                </li>
            </ol>
        </Drawer>
    );
};