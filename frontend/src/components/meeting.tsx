import { message, Spin, Typography, Input, Space, Drawer, Row, Col, Button } from 'antd';
import { post } from '../common/request';
import { useState } from 'react';

import { BulbOutlined } from '@ant-design/icons';

const functionName = '議事録生成';
const initialContent = '文字起こしデータを入力ください。';

export const MeetComponent = () => {
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [baseMeetContent, setBaseMeetContent] = useState('');

    const [model, setModel] = useState('');
    const [result, setResult] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);

    const send = async () => {
        if (baseMeetContent.trim() === '') {
            messageApi.error('文字起こしデータを入力してください。');
            return;
        }

        setLoading(true);
        try {
            const path = '/private/ai/gemini/meeting';
            const data = {
                message: baseMeetContent,
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

                setBaseMeetContent('');
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
                                    value={baseMeetContent}
                                    onChange={(e) => setBaseMeetContent(e.target.value)}
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
            title={functionName + "指示文"}
            placement="right"
            closable={false}
            onClose={props.dismissModal}
            open={props.isModalOpen}
        >
            <Typography.Title level={4}>指示</Typography.Title>
            <Typography.Paragraph>
                以下の情報と構造化ルールに基づき、提供されたミーティングの文字起こしテキストを分析・構造化し、その結果を用いて議事録を作成してください。
            </Typography.Paragraph>

            <Typography.Title level={4}>入力情報</Typography.Title>
            <Typography.Title level={5}>1. ミーティング情報（可能な範囲で具体的に入力してください）</Typography.Title>
            <ul>
                <li>
                    <strong>会議名/件名:</strong> <span>（例：〇〇プロジェクト定例会議 第5回）</span>
                </li>
                <li>
                    <strong>日時:</strong> <span>（例：YYYY年MM月DD日 HH:MM - HH:MM）</span>
                </li>
                <li>
                    <strong>場所:</strong> <span>（例：オンライン、第1会議室 など）</span>
                </li>
                <li>
                    <strong>参加者リスト:</strong>
                    <ul>
                        <li>山田 太郎 (プロジェクトマネージャー)</li>
                        <li>佐藤 花子 (開発担当)</li>
                        <li>鈴木 一郎 (営業担当)</li>
                    </ul>
                </li>
                <li>
                    <strong>ミーティングの目的:</strong> <span>（例：〇〇機能の仕様決定、進捗確認と課題共有）</span>
                </li>
                <li>
                    <strong>事前に配布された議題:</strong>
                    <ul>
                        <li>1. 〇〇機能の仕様について</li>
                        <li>2. 現在の進捗状況報告</li>
                        <li>3. 課題と懸念点の共有</li>
                        <li>4. 次回までのアクション確認</li>
                    </ul>
                </li>
                <li>
                    <strong>期待する議事録の形式・詳細度:</strong> <span>（例：決定事項・ToDo中心の要点、発言者ごとの詳細記述、報告書形式など）</span>
                </li>
                <li>
                    <strong>その他特記事項:</strong> <span>（例：文字起こしデータに一部音声不明瞭箇所あり。特定の話者の発言を重点的に記録したい、など）</span>
                </li>
            </ul>

            <Typography.Title level={5}>3. 文字起こしテキスト</Typography.Title>
            <Typography.Paragraph>
                <pre style={{ background: '#f5f5f5', padding: '1em', borderRadius: 4 }}>
                    （ここに文字起こしテキストを貼り付ける）
                </pre>
            </Typography.Paragraph>

            <Typography.Title level={3} style={{ marginTop: 32 }}>出力要件</Typography.Title>

            <ol>
                <li>
                    <strong>構造化データの作成:</strong>
                    <ul>
                        <li>上記の「構造化ルール」に従い、文字起こしテキストと「ミーティング情報」を分析し、JSON形式で情報を整理・抽出してください。</li>
                        <li>各項目について、テキスト内の具体的な発言や文脈から情報を埋めてください。推測が必要な場合は、その旨がわかるように記述してください (例: 「(推測) 〇〇について」)。</li>
                        <li><strong>特に「決定事項」「ToDoリスト」「合意事項」を正確かつ具体的に抽出することに重点を置いてください。</strong></li>
                        <li>該当する情報が見つからない項目は <code>null</code> または空の配列 <code>[]</code> としてください。感情や希望、会話評価といった主観的で判断が難しい項目は、明確な根拠がない限り含めなくて構いません。</li>
                        <li>参加者名は、可能な限り「ミーティング情報」のリストと照合し、フルネームで記載してください。不明瞭な場合はテキストの表記に従い、[話者不明]などとしてください。</li>
                    </ul>
                </li>
                <li>
                    <strong>議事録の作成:</strong>
                    <ul>
                        <li>作成した構造化データに基づき、<strong>「期待する議事録の形式・詳細度」</strong> の指定があればそれに従い、なければ以下の<strong>標準形式</strong>で、自然で分かりやすい文章の議事録を作成してください。</li>
                        <li>
                            <strong>標準議事録形式:</strong>
                            <ul>
                                <li><strong>件名:</strong> （会議名/件名）</li>
                                <li><strong>日時:</strong></li>
                                <li><strong>場所:</strong></li>
                                <li><strong>参加者:</strong> （敬称略、役職等あれば付記）</li>
                                <li><strong>目的:</strong></li>
                                <li><strong>議題:</strong> （箇条書き）</li>
                                <li>---</li>
                                <li><strong>決定事項:</strong> （箇条書きで具体的に）</li>
                                <li><strong>ToDoリスト:</strong> （担当者、タスク内容、期限を明記した表形式または箇条書き）</li>
                                <li><strong>合意事項:</strong> （箇条書きで具体的に）</li>
                                <li><strong>共有事項・報告事項:</strong> （箇条書き、必要に応じて発言者名を付記）</li>
                                <li><strong>提起された課題・懸念点:</strong> （箇条書き、必要に応じて提起者名を付記）</li>
                                <li><strong>その他特筆事項:</strong></li>
                                <li><strong>次回予定:</strong></li>
                            </ul>
                        </li>
                        <li>文字起こしテキストから直接判断できない情報（会議名、日時、場所、目的、議題など）は、「ミーティング情報」を最優先で参照してください。情報がない場合は「不明」と記載してください。</li>
                        <li>文字起こしテキスト中の不明瞭な箇所（話者、内容）は、議事録にもその旨を注記してください (例: 「[内容不明瞭]」、「玉井氏の発言（一部不明瞭）」など)。</li>
                        <li>構造化データの内容を忠実に反映しつつ、議事録として読みやすいように体裁を整えてください。</li>
                    </ul>
                </li>
            </ol>
        </Drawer >
    );
};