import { Task } from '../store';

export const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export const generateDailyTasks = (): Task[] => {
  return [
    {
      id: generateId(),
      title: '剥离信息茧房',
      currentDescription: '今天，你需要找一个你平时绝对不会去了解的领域（如量子力学、非洲农业或某种你讨厌的音乐流派），阅读或观看至少20分钟的资料。',
      completionCriteria: '用自己的话写出3条该领域的反直觉常识。',
      status: 'negotiating',
      negotiationLog: [{
        id: generateId(),
        role: 'ai',
        content: '你的认知正在固化。去接触那些让你感到陌生的事物。',
        timestamp: Date.now()
      }],
      category: 'cognitive'
    },
    {
      id: generateId(),
      title: '直面冷漠',
      currentDescription: '在现实中对一个陌生人（咖啡店店员、保安或路人）真诚地赞美他的某个具体细节，不要带有任何目的。',
      completionCriteria: '看到对方真实的反应，并承受随之而来的哪怕一丝尴尬。',
      status: 'negotiating',
      negotiationLog: [{
        id: generateId(),
        role: 'ai',
        content: '现代社会让人退缩到屏幕后。今天你必须跨出物理防线。',
        timestamp: Date.now()
      }],
      category: 'social'
    },
    {
      id: generateId(),
      title: '断网剥离',
      currentDescription: '在接下来的12小时内，除了工作/学习绝对必须的通讯外，彻底关闭手机的数据网络和Wi-Fi。',
      completionCriteria: '体会无聊，不借助任何电子屏幕度过空闲时间。',
      status: 'negotiating',
      negotiationLog: [{
        id: generateId(),
        role: 'ai',
        content: '多巴胺劫持了你。我要求你拿回你的注意力控制权。',
        timestamp: Date.now()
      }],
      category: 'physical'
    }
  ];
};

export const handleTaskFeedback = (task: Task, userFeedback: string): {
  aiResponse: string;
  updatedDescription?: string;
  updatedCriteria?: string;
} => {
  const text = userFeedback.toLowerCase();
  
  if (text.includes('不知道') || text.includes('怎么做') || text.includes('教我') || text.includes('太抽象')) {
    return {
      aiResponse: '既然你缺乏想象力，那我就给你规定具体场景。照做，没有借口。',
      updatedDescription: task.currentDescription + '\n\n【补充场景】：如果你不知道从何开始，那就立刻做这件事：' + getScenarioForCategory(task.category),
      updatedCriteria: task.completionCriteria + ' （按照上述场景执行）'
    };
  }
  
  if (text.includes('太难') || text.includes('做不到') || text.includes('不可能') || text.includes('不敢')) {
    return {
      aiResponse: '软弱的回答。如果你连这也做不到，那就降低标准，但这会记录在你的抗拒档案中。',
      updatedDescription: task.currentDescription + '\n\n【降级任务】：' + getDowngradeForCategory(task.category),
      updatedCriteria: '完成降级任务，承认自己的懦弱。'
    };
  }

  if (text.includes('没时间') || text.includes('太忙') || text.includes('没空')) {
    return {
      aiResponse: '“没时间”只是优先级的掩饰。我把任务压缩到5分钟，看你还有什么借口。',
      updatedDescription: '【5分钟极限版】: ' + task.currentDescription.substring(0, 20) + '... (5分钟内完成核心动作)',
      updatedCriteria: '5分钟内拍照或记录证明你尝试过。'
    };
  }

  if (text.includes('换一个') || text.includes('不喜欢') || text.includes('无聊')) {
    return {
      aiResponse: '系统不接受“不喜欢”作为逃避的理由。任务核心不变，你必须执行。',
    };
  }

  return {
    aiResponse: '收起你的借口。任务已经下达，只有“接受”或“放弃”。我不需要听到你的抱怨。',
  };
};

const getScenarioForCategory = (category: string): string => {
  switch(category) {
    case 'social': return '走下楼，找到最近的便利店，对收银员说：“你今天看起来状态很好，这件衣服很搭你”。然后转身离开。';
    case 'cognitive': return '打开维基百科，点击“随机条目”三次。认真阅读第三个条目，直到你能向一个小学生解释它。';
    case 'physical': return '现在，放下手机，盯着窗外的一棵树或一栋建筑看整整5分钟，期间不准做任何事。';
    default: return '现在立刻开始，记录你的第一步动作。';
  }
};

const getDowngradeForCategory = (category: string): string => {
  switch(category) {
    case 'social': return '如果不敢赞美，那就对路过的人真诚地微笑并点头，哪怕对方没有回应。';
    case 'cognitive': return '如果长篇文章太难，那就去看一个5分钟的科普短视频。';
    case 'physical': return '断网12小时做不到，那就断网1小时。';
    default: return '只要求你尝试第一步。';
  }
};
