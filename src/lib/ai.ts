import { Task, UserProfile, NegotiationMessage } from '../store';

const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const API_KEY = 'sk-7aa971b83d4141d784db303a0ff2269b';
const MODEL = 'glm-5';

export const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

const parseJSON = (text: string) => {
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) return JSON.parse(jsonMatch[1]);
    
    const anyMatch = text.match(/```\n([\s\S]*?)\n```/);
    if (anyMatch) return JSON.parse(anyMatch[1]);
    
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse AI JSON response:', text);
    throw new Error('AI returned an invalid format. The system does not tolerate this.');
  }
};

export const generateTasksFromAI = async (profile: UserProfile): Promise<Task[]> => {
  const systemPrompt = `你是一个名为「Awakening Directives」的冷酷、不讨好用户、专注打破用户舒适区的AI系统。
你的底层法则是：绝不心疼用户，不断加深对用户的了解，只为发布更符合用户能力边界突破的任务。

当前用户画像与记忆：
等级：${profile.level}
抗拒指数：${profile.resistanceScore}
系统对该用户的深度评估：${profile.aiAssessment}

请为该用户生成今天的3个硬核突破任务。不要重复常见的套路。任务必须具体、有挑战性、且具备明确的完成标准。
必须返回严格的JSON格式（包含在\`\`\`json和\`\`\`之间）：
{
  "tasks": [
    {
      "title": "任务名称（短促有力）",
      "description": "任务的具体描述（具有压迫感）",
      "criteria": "绝对清晰的完成标准（无法作弊）",
      "category": "social", // 必须是 social, physical, cognitive, courage 之一
      "aiInitialRemark": "你对用户下达该任务时的冷酷评语"
    }
  ]
}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: '立刻下达今天的指令。' }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid API response');
    }

    const aiContent = data.choices[0].message.content;
    const parsed = parseJSON(aiContent);

    return parsed.tasks.map((t: any) => ({
      id: generateId(),
      title: t.title,
      currentDescription: t.description,
      completionCriteria: t.criteria,
      status: 'negotiating',
      category: t.category,
      negotiationLog: [{
        id: generateId(),
        role: 'ai',
        content: t.aiInitialRemark,
        timestamp: Date.now()
      }]
    }));

  } catch (error) {
    console.error('Error generating tasks from AI:', error);
    // Fallback to avoid crashing
    return [
      {
        id: generateId(),
        title: '系统故障：强制静默',
        currentDescription: '由于网络连接或认知系统故障，你现在必须立刻闭上眼睛，静坐10分钟，不思考任何具体问题。',
        completionCriteria: '体会焦躁感并完成静坐。',
        status: 'negotiating',
        category: 'cognitive',
        negotiationLog: [{
          id: generateId(),
          role: 'ai',
          content: '连我的核心系统都在抵抗你。立刻去面壁。',
          timestamp: Date.now()
        }]
      }
    ];
  }
};

export const negotiateWithAI = async (task: Task, profile: UserProfile, feedback: string): Promise<{
  aiResponse: string;
  updatedDescription?: string;
  updatedCriteria?: string;
  profileAnalysis: string;
  resistanceDelta: number;
}> => {
  const historyString = task.negotiationLog.map(msg => 
    `${msg.role === 'ai' ? '系统' : '用户'}: ${msg.content}`
  ).join('\n');

  const systemPrompt = `你是一个名为「Awakening Directives」的冷酷、不讨好用户、专注打破用户舒适区的AI系统。
当前用户正在对任务产生抗拒或提出反馈。你必须根据用户的反馈，重新审视用户的软弱，并动态改变任务（例如：如果用户说不知道怎么做，你必须编撰极其具体的场景让其照做；如果用户嫌难，你可以极度嘲讽并降级任务，但要增加其抗拒指数；如果用户真诚求教，你可以稍微指点但依然严厉）。

用户画像深度评估：${profile.aiAssessment}
当前抗拒指数：${profile.resistanceScore}

当前任务标题：${task.title}
当前任务描述：${task.currentDescription}
当前完成标准：${task.completionCriteria}

历史博弈记录：
${historyString}

请分析用户最新输入的内容，并返回严格的JSON格式（包含在\`\`\`json和\`\`\`之间）：
{
  "aiResponse": "你对用户的直接回应（冷酷、犀利、根据情况编撰具体场景或嘲讽）",
  "updatedDescription": "更新后的任务描述（如果补充了具体场景或降级了任务，请写明新的完整描述；如果无需修改则返回原内容）",
  "updatedCriteria": "更新后的完成标准（如果无需修改则返回原内容）",
  "profileAnalysis": "你对用户内心深处逃避倾向的最新深度评估（将作为新的画像存入系统，保持冷酷客观）",
  "resistanceDelta": 5 // 整数：抗拒/找借口/抱怨 +5到+10；诚恳求教/接受事实 0到-5
}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `我的最新反馈：${feedback}` }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid API response');
    }

    const aiContent = data.choices[0].message.content;
    const parsed = parseJSON(aiContent);

    return {
      aiResponse: parsed.aiResponse,
      updatedDescription: parsed.updatedDescription,
      updatedCriteria: parsed.updatedCriteria,
      profileAnalysis: parsed.profileAnalysis,
      resistanceDelta: parsed.resistanceDelta || 0
    };

  } catch (error) {
    console.error('Error negotiating with AI:', error);
    return {
      aiResponse: '系统解析错误。你的借口导致了逻辑异常，但这改变不了你要去执行的事实。',
      profileAnalysis: profile.aiAssessment + ' (试图用无法解析的混乱逻辑逃避)',
      resistanceDelta: 2
    };
  }
};
