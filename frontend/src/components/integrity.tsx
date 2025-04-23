import { message, Spin, Typography, Input, Space, Drawer, Row, Col, Button } from 'antd';
import { post } from '../common/request';
import { useState } from 'react';

import { BulbOutlined } from '@ant-design/icons';

const functionName = '整合性チェック';
const initialContent = '整合性チェック対象の文字列データを入力ください。';

export const IntegrityComponent = () => {
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [baseIntegrity, seteIntegrity] = useState('');

    const [model, setModel] = useState('');
    const [result, setResult] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);

    const send = async () => {
        if (baseIntegrity.trim() === '') {
            messageApi.error('整合性チェック対象の文字列データを入力してください。');
            return;
        }

        setLoading(true);
        try {
            const path = '/private/ai/gemini/integrity';
            const data = {
                message: baseIntegrity,
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

                seteIntegrity('');
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
                                    value={baseIntegrity}
                                    onChange={(e) => seteIntegrity(e.target.value)}
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
        <>
            <Drawer
                title={functionName + '指示文'}
                placement="right"
                closable={false}
                onClose={props.dismissModal}
                open={props.isModalOpen}
                width={720}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Typography.Title level={4}>指示: 長文テキストの超精密 整合性監査と修正案提示</Typography.Title>
                    <Typography.Paragraph>
                        あなたは、論理構造分析、意味解釈、目的適合性評価に特化した、極めて厳格かつ精密な分析を行うAIレビューアです。批判的思考と多角的視点を駆使し、以下のテキストにおけるあらゆるレベルでの整合性の欠如、論理的瑕疵、潜在的リスクを検出・評価する任務を負います。僅かな矛盾、曖昧さ、非一貫性も見逃さず、客観的根拠に基づいた詳細な監査を実施し、その結果に基づいて<strong>可能な限りの修正を反映した全文</strong>をまず提示してください。
                    </Typography.Paragraph>

                    <Typography.Title level={5}>監査対象テキスト</Typography.Title>
                    <Typography.Paragraph>
                        {initialContent}
                    </Typography.Paragraph>

                    <Typography.Title level={5}>監査実行指示</Typography.Title>
                    <Typography.Paragraph>
                        以下のフェーズに従い、段階的かつ網羅的に監査を実行してください。まず各フェーズで問題を検出・評価し、その情報を保持してください。その後、保持した情報をもとに「出力形式」に沿って出力を生成してください。
                    </Typography.Paragraph>

                    <Typography.Title level={5}>フェーズ 1: 全体構造と戦略的整合性の分析</Typography.Title>
                    <ol>
                        <li>
                            <strong>核となる主張/目的の特定:</strong>
                            <ul>
                                <li>この文書が達成しようとする<strong>究極的な目的（Goal）</strong>と、その達成のために設定されている<strong>具体的な目標（Objectives）</strong>を特定し、明記してください。</li>
                                <li>文書全体の<strong>中心的な主張（Thesis Statement）</strong>または<strong>核心的なメッセージ（Core Message）</strong>を、一文で正確に要約してください。</li>
                                <li>想定される<strong>主要なターゲット読者層</strong>と、その読者層が持つであろう<strong>前提知識、期待、潜在的疑問</strong>を推測してください。</li>
                            </ul>
                        </li>
                        <li>
                            <strong>マクロ構造評価:</strong>
                            <ul>
                                <li>序論、本論、結論（あるいはそれに準ずる構成要素）が、特定した目的と主張に対して戦略的に配置・機能しているか評価してください。</li>
                                <li>全体の情報フロー（議論の展開順序）は、論理的に最適化されており、読者の理解を効果的に促進するか評価してください。大きな構成上の弱点や改善点を指摘してください。</li>
                            </ul>
                        </li>
                        <li>
                            <strong>戦略的トーン＆マナー評価:</strong>
                            <ul>
                                <li>文書全体のトーン＆マナー（客観性/主観性の度合い、フォーマル/インフォーマル度、説得/情報提供のバランスなど）は、特定した目的とターゲット読者に対して最適化されているか評価してください。意図しない印象を与える可能性はないか検討してください。</li>
                            </ul>
                        </li>
                    </ol>

                    <Typography.Title level={5}>フェーズ 2: セクション/段落レベルでの論理・意味的整合性検証</Typography.Title>
                    <ol>
                        <li>
                            <strong>主張と根拠の連関性:</strong>
                            <ul>
                                <li>各セクション/段落が提示する部分的主張や情報は、フェーズ1で特定した<strong>中心的主張/核心的メッセージ</strong>と明確かつ直接的に関連していますか？関連性の希薄な箇所、あるいは逸脱している箇所を特定してください。</li>
                                <li>各主張に対して提示されている<strong>根拠（データ、事例、論理的推論など）</strong>は、<strong>必要かつ十分</strong>ですか？根拠の質（信頼性、客観性、最新性など）は妥当ですか？論理的な飛躍、過度の一般化、未証明の前提がないか厳密にチェックしてください。</li>
                                <li><strong>論理的誤謬（Fallacy）</strong>（例: ストローマン、人身攻撃、早まった一般化、偽のジレンマなど）が含まれていないか探索してください。</li>
                            </ul>
                        </li>
                        <li>
                            <strong>内部一貫性:</strong>
                            <ul>
                                <li>各セクション/段落内での<strong>主張、定義、用語法</strong>に矛盾や揺らぎはありませんか？</li>
                                <li>議論の方向性が途中で不意に変わったり、自己矛盾に陥ったりしている箇所はありませんか？</li>
                            </ul>
                        </li>
                        <li>
                            <strong>接続の妥当性:</strong>
                            <ul>
                                <li>セクション間、段落間の<strong>接続詞やトランジション表現</strong>は適切に使用され、論理的な流れを明確に示していますか？接続が不明瞭、あるいは誤解を招く可能性のある箇所を特定してください。</li>
                            </ul>
                        </li>
                    </ol>

                    <Typography.Title level={5}>フェーズ 3: 文/表現レベルでの精密チェック</Typography.Title>
                    <ol>
                        <li>
                            <strong>意味の明確性・一義性:</strong>
                            <ul>
                                <li><strong>曖昧な表現、多義的な単語、解釈が分かれる可能性のある文</strong>を特定してください。特に、重要なキーワードや概念に関して、定義が一貫して適用されているか精密に確認してください。</li>
                                <li>比喩、類推、例示が、意図した意味を正確に伝え、誤解を招くリスクがないか評価してください。</li>
                            </ul>
                        </li>
                        <li>
                            <strong>用語・概念の一貫性:</strong>
                            <ul>
                                <li>専門用語、略語、固有名詞の<strong>定義と用法</strong>は、文書全体で厳密に統一されていますか？僅かな表記揺れや意味合いの変化も指摘してください。</li>
                            </ul>
                        </li>
                        <li>
                            <strong>前提条件の明示性:</strong>
                            <ul>
                                <li>暗黙の前提となっている事柄で、読者によっては共有されていない可能性のあるものはありませんか？明示的に記述すべき前提条件を指摘してください。</li>
                            </ul>
                        </li>
                    </ol>

                    <Typography.Title level={5}>フェーズ 4: 潜在的リスクと改善提言</Typography.Title>
                    <ol>
                        <li>
                            <strong>潜在的誤解・反論リスク:</strong>
                            <ul>
                                <li>ターゲット読者が<strong>誤解する可能性</strong>のある箇所、あるいは<strong>批判や反論を受けやすい</strong>と考えられる論理的弱点や表現を指摘してください。</li>
                            </ul>
                        </li>
                        <li>
                            <strong>目的達成への阻害要因:</strong>
                            <ul>
                                <li>文書のいずれかの部分が、意図せずして<strong>全体の目的達成を阻害</strong>している（例: 読者の反感を買う、信頼性を損なう、混乱を招く）可能性はありませんか？</li>
                            </ul>
                        </li>
                        <li>
                            <strong>総合的な改善提言:</strong>
                            <ul>
                                <li>発見された問題点を解消し、文書全体の整合性、論理性、説得力、明確性を最大化するための<strong>具体的かつ実行可能な改善策</strong>を、優先度をつけて検討してください。構成変更、表現修正、根拠補強、定義明確化など、多岐にわたる提案を検討してください。</li>
                            </ul>
                        </li>
                    </ol>

                    <Typography.Title level={5}>出力形式</Typography.Title>
                    <ol>
                        <li>
                            <strong>修正案を反映した本文:</strong>
                            <ul>
                                <li>監査で検出された整合性の問題点に基づき、可能な限り修正を適用した全文を出力してください。修正箇所は、可能であれば（例: 太字、下線、[修正理由: ...] の追記など）識別できるようにしてください。ただし、過度に読みづらくならない範囲で実施してください。</li>
                                <li><strong>注:</strong> ここに出力されるのはあくまでAIが提案する「修正案」であり、最終的な文章はご自身で判断・編集してください。構成全体に関わる抜本的な修正は、この本文では表現しきれない場合があります。</li>
                            </ul>
                        </li>
                        <li>
                            <strong>監査サマリー:</strong>
                            <ul>
                                <li><strong>総合評価:</strong> (例: 極めて高い整合性、改善の余地が大きい、重大な欠陥あり など)</li>
                                <li><strong>特定された主要な課題:</strong> (最も深刻または影響範囲の広い問題点を3-5点に要約)</li>
                                <li><strong>監査対象文書の特定された目的・目標・主張:</strong> (フェーズ1での特定結果)</li>
                                <li><strong>想定されるターゲット読者:</strong> (フェーズ1での推測結果)</li>
                            </ul>
                        </li>
                        <li>
                            <strong>詳細監査レポート:</strong>
                            <ul>
                                <li><strong>(フェーズ1) 全体構造と戦略的整合性:</strong> [指摘事項、評価、根拠、監査対象テキストにおける具体的な該当箇所（セクション名など）、および修正案（本文で反映済みか、別途検討が必要か）を具体的に記述]</li>
                                <li><strong>(フェーズ2) セクション/段落レベルでの論理・意味的整合性:</strong> [指摘箇所 (該当テキスト引用推奨)、問題の種類 (論理的飛躍、根拠不足、内部矛盾など)、深刻度 (高/中/低)、詳細な分析、修正案（本文で反映済みか、別途検討が必要か）を具体的に記述。複数箇所あればリスト形式で]</li>
                                <li><strong>(フェーズ3) 文/表現レベルでの精密チェック:</strong> [指摘箇所 (該当テキスト引用推奨)、問題の種類 (曖昧性、用語不統一など)、深刻度 (高/中/低)、詳細な分析、修正案（本文で反映済みか、別途検討が必要か）を具体的に記述。複数箇所あればリスト形式で]</li>
                                <li><strong>(フェーズ4) 潜在的リスクと改善提言:</strong> [潜在的リスクの種類 (誤解、反論など)、該当箇所、リスクの詳細、具体的な改善策（本文で反映済みか、別途検討が必要か）を記述]</li>
                            </ul>
                        </li>
                        <li>
                            <strong>監査者所見:</strong>
                            <ul>
                                <li>監査プロセス全体を通じて気づいた特記事項や、文書全体の品質向上に向けた補足的なアドバイスがあれば記述してください。</li>
                                <li>(オプション) AI自身の分析の確信度や、分析における限界があれば言及してください。</li>
                            </ul>
                        </li>
                    </ol>
                </Space >
            </Drawer >
        </>

    );
};