import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding Wakeely Pro database...\n');

  // ─── Clean existing data (order matters for FK constraints) ──────
  console.log('🗑️  Cleaning existing data...');
  await db.activity.deleteMany();
  await db.timelineEvent.deleteMany();
  await db.billing.deleteMany();
  await db.caseDocument.deleteMany();
  await db.task.deleteMany();
  await db.case.deleteMany();
  await db.client.deleteMany();
  await db.lawyer.deleteMany();
  await db.featureFlag.deleteMany();

  // ─── 1. Lawyer ────────────────────────────────────────────────────
  const lawyer = await db.lawyer.create({
    data: {
      name: 'عبدالله المحمدي',
      email: 'abdullah@wakeely.pro',
      firm: 'المحاماة المتخصصة',
      role: 'lawyer',
      licenseNo: 'SA-LAW-2023-00451',
      phone: '+966501234567',
    },
  });
  console.log(`✅ Lawyer created: ${lawyer.name} (${lawyer.email})`);

  // ─── 2. Clients ───────────────────────────────────────────────────
  const clients = await Promise.all([
    db.client.create({
      data: {
        fullName: 'محمد بن خالد الراشدي',
        email: 'mohammed.alrashidi@email.com',
        phone: '+966551112233',
        nationalId: '1098765432',
        address: 'الرياض، حي الملقا، شارع الأمير سلطان',
        type: 'individual',
      },
    }),
    db.client.create({
      data: {
        fullName: 'شركة النور للتجارة',
        email: 'info@alnoor-trade.com',
        phone: '+966112345678',
        address: 'جدة، حي الحمراء، طريق المدينة',
        company: 'شركة النور للتجارة',
        type: 'corporate',
      },
    }),
    db.client.create({
      data: {
        fullName: 'فاطمة بنت عبدالرحمن القحطاني',
        email: 'fatima.qahtani@email.com',
        phone: '+966504445566',
        nationalId: '1087654321',
        address: 'الدمام، حي الشاطئ، شارع الملك فهد',
        type: 'individual',
      },
    }),
    db.client.create({
      data: {
        fullName: 'شركة البناء المتقدم المحدودة',
        email: 'legal@advanced-build.com',
        phone: '+966133456789',
        address: 'الرياض، حي العليا، شارع التحلية',
        company: 'شركة البناء المتقدم المحدودة',
        type: 'corporate',
      },
    }),
    db.client.create({
      data: {
        fullName: 'سلطان بن فهد العتيبي',
        email: 'sultan.otaybi@email.com',
        phone: '+966507778899',
        nationalId: '1076543210',
        address: 'مكة المكرمة، حي العزيزية',
        type: 'individual',
      },
    }),
  ]);
  console.log(`✅ ${clients.length} clients created`);

  // ─── 3. Cases ─────────────────────────────────────────────────────
  const cases = await Promise.all([
    // Case 1 - Active Civil
    db.case.create({
      data: {
        caseNumber: 'CIV-2024-001',
        title: 'نزاع عقاري على أرض في شمال الرياض',
        description: 'نزاع بين الطرفين حول ملكية أرض زراعية مساحتها 5000 متر مربع في منطقة شمال الرياض. يدعي المدعي حق الملكية بناءً على عقد بيع قديم.',
        caseType: 'real_estate',
        status: 'active',
        priority: 'high',
        court: 'المحكمة العامة بالرياض',
        judge: 'القاضي أحمد الشمري',
        filedDate: new Date('2024-01-15'),
        nextHearing: new Date('2025-02-10'),
        value: 2500000,
        currency: 'SAR',
        notes: 'يحتاج إلى تحديث مستندات الملكية من البلدية',
        isPro: true,
        isVisibleToClient: true,
        lawyerId: lawyer.id,
        clientId: clients[0].id,
      },
    }),
    // Case 2 - Active Criminal
    db.case.create({
      data: {
        caseNumber: 'CRM-2024-002',
        title: 'قضية تزوير مستندات تجارية',
        description: 'اتهام بالتزوير في مستندات تجارية وتوقيعات مزيفة على عقود بيع. القضية معروضة على النيابة العامة للتحقيق.',
        caseType: 'criminal',
        status: 'discovery',
        priority: 'urgent',
        court: 'المحكمة الجزائية بالرياض',
        judge: 'القاضي فيصل الدوسري',
        filedDate: new Date('2024-02-20'),
        nextHearing: new Date('2025-01-28'),
        value: 500000,
        currency: 'SAR',
        isPro: true,
        isVisibleToClient: false,
        lawyerId: lawyer.id,
        clientId: clients[1].id,
      },
    }),
    // Case 3 - Active Commercial
    db.case.create({
      data: {
        caseNumber: 'COM-2024-003',
        title: 'نزاع عقد توريد مواد بناء',
        description: 'نزاع تجاري بين شركة النور للتجارة ومقاول بشأن عقد توريد مواد بناء. الطرف الأول يطالب بتعويض عن تأخير التسليم.',
        caseType: 'commercial',
        status: 'active',
        priority: 'high',
        court: 'المحكمة التجارية بالرياض',
        judge: 'القاضي سعد الحربي',
        filedDate: new Date('2024-03-10'),
        nextHearing: new Date('2025-02-15'),
        value: 1800000,
        currency: 'SAR',
        isPro: true,
        isVisibleToClient: true,
        lawyerId: lawyer.id,
        clientId: clients[1].id,
      },
    }),
    // Case 4 - Active Labor
    db.case.create({
      data: {
        caseNumber: 'LAB-2024-004',
        title: 'دعوى تعويض عن فصل تعسفي',
        description: 'دعوى مقامة من الموظفة فاطمة القحطاني ضد شركة سابقة للمطالبة بتعويض عن الفصل التعسفي وعدم صرف مستحقات نهاية الخدمة.',
        caseType: 'labor',
        status: 'active',
        priority: 'medium',
        court: 'محكمة العمل بالدمام',
        judge: 'القاضي عبدالعزيز المطيري',
        filedDate: new Date('2024-04-05'),
        nextHearing: new Date('2025-02-20'),
        value: 350000,
        currency: 'SAR',
        isPro: true,
        isVisibleToClient: true,
        lawyerId: lawyer.id,
        clientId: clients[2].id,
      },
    }),
    // Case 5 - Active Family
    db.case.create({
      data: {
        caseNumber: 'FAM-2024-005',
        title: 'دعوى حضانة ونفقة أطفال',
        description: 'دعوى مطالبة بحضانة الأطفال الثلاثة ونفقة شهرية. يتضمن النزاع تحديد مكان إقامة الأطفال وحق الزيارة.',
        caseType: 'family',
        status: 'active',
        priority: 'high',
        court: 'محكمة الأحوال الشخصية بالرياض',
        judge: 'القاضي محمد العنزي',
        filedDate: new Date('2024-03-25'),
        nextHearing: new Date('2025-02-05'),
        value: 0,
        currency: 'SAR',
        notes: 'قضية حساسة تحتاج تعامل دقيق',
        isPro: true,
        isVisibleToClient: true,
        lawyerId: lawyer.id,
        clientId: clients[2].id,
      },
    }),
    // Case 6 - Closed Civil
    db.case.create({
      data: {
        caseNumber: 'CIV-2023-006',
        title: 'قضية تحصيل دين تجاري',
        description: 'قضية تحصيل دين مستحق لشركة البناء المتقدم من عميل سابق بقيمة 750,000 ريال. تم الحكم لصالح الموكل.',
        caseType: 'civil',
        status: 'closed',
        priority: 'medium',
        court: 'المحكمة العامة بالرياض',
        judge: 'القاضي خالد العمري',
        filedDate: new Date('2023-06-10'),
        closedDate: new Date('2024-08-15'),
        value: 750000,
        currency: 'SAR',
        isPro: false,
        isVisibleToClient: true,
        lawyerId: lawyer.id,
        clientId: clients[3].id,
      },
    }),
    // Case 7 - Active Commercial
    db.case.create({
      data: {
        caseNumber: 'COM-2024-007',
        title: 'نزاع شراكة تجارية بين شركاء',
        description: 'نزاع بين شركاء في شركة تجارية حول توزيع الأرباح وإدارة الشركة. يتم التحضير لعرض الوساطة.',
        caseType: 'commercial',
        status: 'settlement',
        priority: 'high',
        court: 'مركز الوساطة التجاري بالرياض',
        judge: 'المُوَسِّط ناصر السبيعي',
        filedDate: new Date('2024-05-20'),
        value: 5000000,
        currency: 'SAR',
        isPro: true,
        isVisibleToClient: false,
        lawyerId: lawyer.id,
        clientId: clients[3].id,
      },
    }),
    // Case 8 - Active Criminal
    db.case.create({
      data: {
        caseNumber: 'CRM-2024-008',
        title: 'قضية احتيال إلكتروني',
        description: 'قضية احتيال عبر منصة إلكترونية حيث تم تحويل مبالغ مالية بطريقة الاحتيال. تم تقديم بلاغ للنيابة العامة.',
        caseType: 'criminal',
        status: 'intake',
        priority: 'urgent',
        court: 'النيابة العامة - الفرع الإلكتروني',
        value: 1200000,
        currency: 'SAR',
        isPro: true,
        isVisibleToClient: false,
        lawyerId: lawyer.id,
        clientId: clients[4].id,
      },
    }),
    // Case 9 - Closed Labor
    db.case.create({
      data: {
        caseNumber: 'LAB-2023-009',
        title: 'دعوى مطالبة بمستحقات عمالية',
        description: 'دعوى لموظف سابق للمطالبة ببدلات سفر ومكافآت نهاية العام غير المصروفة. تم الصلح بين الطرفين.',
        caseType: 'labor',
        status: 'closed',
        priority: 'low',
        court: 'محكمة العمل بالرياض',
        judge: 'القاضي عبدالإله الزهراني',
        filedDate: new Date('2023-09-01'),
        closedDate: new Date('2024-03-20'),
        value: 95000,
        currency: 'SAR',
        isPro: false,
        isVisibleToClient: true,
        lawyerId: lawyer.id,
        clientId: clients[0].id,
      },
    }),
    // Case 10 - Active Real Estate
    db.case.create({
      data: {
        caseNumber: 'RLE-2024-010',
        title: 'نزاع عقد إيجار تجاري',
        description: 'نزاع بين مؤجر ومستأجر حول شروط عقد إيجار محل تجاري. المستأجر يدعي عدم صيانة المبنى والمؤجر يطالب ببدل إيجار متأخر.',
        caseType: 'real_estate',
        status: 'active',
        priority: 'medium',
        court: 'محكمة التنفيذ بالرياض',
        judge: 'القاضي بندر الرشيدي',
        filedDate: new Date('2024-06-15'),
        nextHearing: new Date('2025-03-01'),
        value: 420000,
        currency: 'SAR',
        isPro: true,
        isVisibleToClient: true,
        lawyerId: lawyer.id,
        clientId: clients[4].id,
      },
    }),
    // Case 11 - Trial Criminal
    db.case.create({
      data: {
        caseNumber: 'CRM-2024-011',
        title: 'قضية شيكات مرتجعة',
        description: 'مقاضاة بسبب صدور شيكات بدون رصيد كافٍ. القضية في مرحلة المحاكمة وتم تقديم أدلة الثبوت.',
        caseType: 'criminal',
        status: 'trial',
        priority: 'high',
        court: 'المحكمة الجزائية بالرياض',
        judge: 'القاضي فيصل الدوسري',
        filedDate: new Date('2024-07-01'),
        nextHearing: new Date('2025-01-30'),
        value: 380000,
        currency: 'SAR',
        isPro: true,
        isVisibleToClient: true,
        lawyerId: lawyer.id,
        clientId: clients[1].id,
      },
    }),
    // Case 12 - Archived Civil
    db.case.create({
      data: {
        caseNumber: 'CIV-2023-012',
        title: 'دعوى تعويض عن حادث مروري',
        description: 'دعوى تعويض عن أضرار مادية وجسدية ناتجة عن حادث مروري. تم الحكم بالتعويض وإغلاق القضية.',
        caseType: 'civil',
        status: 'archived',
        priority: 'low',
        court: 'المحكمة العامة بالرياض',
        judge: 'القاضي خالد العمري',
        filedDate: new Date('2023-02-15'),
        closedDate: new Date('2024-01-10'),
        value: 200000,
        currency: 'SAR',
        isPro: false,
        isVisibleToClient: true,
        lawyerId: lawyer.id,
        clientId: clients[0].id,
      },
    }),
  ]);
  console.log(`✅ ${cases.length} cases created`);

  // ─── 4. Tasks ─────────────────────────────────────────────────────
  const tasks = await Promise.all([
    // Case 1 tasks
    db.task.create({
      data: {
        title: 'تحضير مذكرة دفاع أولية',
        description: 'إعداد مذكرة الدفاع حول ملكية الأرض مع إرفاق كافة المستندات المؤيدة',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date('2025-01-25'),
        caseId: cases[0].id,
        lawyerId: lawyer.id,
      },
    }),
    db.task.create({
      data: {
        title: 'جلب مستندات البلدية',
        description: 'استخراج صورة من مخطط الأرض وشهادة الملكية من أمانة الرياض',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2025-01-20'),
        caseId: cases[0].id,
        lawyerId: lawyer.id,
      },
    }),
    db.task.create({
      data: {
        title: 'مقابلة الشهود',
        description: 'تحديد مواعيد لمقابلة شهود الإثبات وتدوين أقوالهم',
        status: 'pending',
        priority: 'high',
        dueDate: new Date('2025-02-01'),
        caseId: cases[0].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 2 tasks
    db.task.create({
      data: {
        title: 'مراجعة تقرير الخبير الجنائي',
        description: 'دراسة تقرير التزوير المقدم من الإدارة العامة للمختبرات الجنائية',
        status: 'completed',
        priority: 'urgent',
        dueDate: new Date('2024-12-15'),
        completedAt: new Date('2024-12-14'),
        caseId: cases[1].id,
        lawyerId: lawyer.id,
      },
    }),
    db.task.create({
      data: {
        title: 'تحضير أسئلة للنيابة العامة',
        description: 'إعداد قائمة أسئلة للتحقيق مع المتهم في النيابة العامة',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: new Date('2025-01-27'),
        caseId: cases[1].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 3 tasks
    db.task.create({
      data: {
        title: 'تدقيق عقد التوريد',
        description: 'مراجعة كافة بنود عقد التوريد وتحديد مخالفات الطرف الثاني',
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2024-10-01'),
        completedAt: new Date('2024-09-28'),
        caseId: cases[2].id,
        lawyerId: lawyer.id,
      },
    }),
    db.task.create({
      data: {
        title: 'حساب قيمة التعويض المطلوب',
        description: 'حساب الخسائر الفعلية والتعويض عن الأضرار المباشرة وغير المباشرة',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date('2025-02-10'),
        caseId: cases[2].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 4 tasks
    db.task.create({
      data: {
        title: 'جمع كشوف المرتبات',
        description: 'الحصول على كشوف المرتبات الشهرية للموظفة من الشركة المدعى عليها',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date('2024-11-01'),
        completedAt: new Date('2024-10-30'),
        caseId: cases[3].id,
        lawyerId: lawyer.id,
      },
    }),
    db.task.create({
      data: {
        title: 'تحضير طلب صندوق تنمية الموارد البشرية',
        description: 'تقديم طلب للحصول على بيانات من صندوق تنمية الموارد البشرية (هدف)',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2025-02-15'),
        caseId: cases[3].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 5 tasks
    db.task.create({
      data: {
        title: 'إعداد قائمة بحاجات الأطفال',
        description: 'توثيق كافة احتياجات الأطفال المادية والمعنوية لتقديمها للمحكمة',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date('2025-02-03'),
        caseId: cases[4].id,
        lawyerId: lawyer.id,
      },
    }),
    db.task.create({
      data: {
        title: 'تعيين محامي للأطفال',
        description: 'تقديم طلب لتعيين محامي خاص يمثل مصالح الأطفال في القضية',
        status: 'pending',
        priority: 'high',
        dueDate: new Date('2025-01-30'),
        caseId: cases[4].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 7 tasks
    db.task.create({
      data: {
        title: 'تجهيز ملف الوساطة',
        description: 'إعداد ملخص النزاع ووثائق الشراكة لتقديمها لمركز الوساطة',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date('2025-02-12'),
        caseId: cases[6].id,
        lawyerId: lawyer.id,
      },
    }),
    db.task.create({
      data: {
        title: 'حساب حصص الأرباح',
        description: 'مراجعة السجلات المالية للشركة وحساب حصة كل شريك من الأرباح',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2025-02-18'),
        caseId: cases[6].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 8 tasks
    db.task.create({
      data: {
        title: 'تقديم بلاغ للنيابة العامة',
        description: 'إعداد وتقديم بلاغ رسمي للنيابة العامة مع إرفاق الأدلة الرقمية',
        status: 'completed',
        priority: 'urgent',
        dueDate: new Date('2024-08-01'),
        completedAt: new Date('2024-07-28'),
        caseId: cases[7].id,
        lawyerId: lawyer.id,
      },
    }),
    db.task.create({
      data: {
        title: 'جمع الأدلة الرقمية',
        description: 'التنسيق مع فريق الأمن السيبراني لجمع وتأمين الأدلة الإلكترونية',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: new Date('2025-02-05'),
        caseId: cases[7].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 10 tasks
    db.task.create({
      data: {
        title: 'مراجعة عقد الإيجار',
        description: 'تحليل بنود عقد الإيجار وتحديد الالتزامات المترتبة على كل طرف',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date('2024-11-15'),
        completedAt: new Date('2024-11-12'),
        caseId: cases[9].id,
        lawyerId: lawyer.id,
      },
    }),
    db.task.create({
      data: {
        title: 'تقرير خبير عقاري',
        description: 'طلب تعيين خبير عقاري لتقييم حالة المبنى وتحديد تكاليف الصيانة',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2025-02-25'),
        caseId: cases[9].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 11 tasks
    db.task.create({
      data: {
        title: 'إعداد مذكرة الرد على الادعاء',
        description: 'تحضير مذكرة قانونية للرد على ادعاءات المدعي العام في قضية الشيكات',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date('2025-01-28'),
        caseId: cases[10].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 4 extra task
    db.task.create({
      data: {
        title: 'توثيق شهادات الزملاء السابقين',
        description: 'جمع شهادات من زملاء العمل السابقين حول ظروف الفصل',
        status: 'pending',
        priority: 'low',
        dueDate: new Date('2025-03-01'),
        caseId: cases[3].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 5 extra task
    db.task.create({
      data: {
        title: 'تقديم طلب نفقة مؤقتة',
        description: 'إعداد وتقديم طلب للنفقة المؤقتة ريثما يتم البت في القضية',
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2024-06-01'),
        completedAt: new Date('2024-05-29'),
        caseId: cases[4].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 1 extra task
    db.task.create({
      data: {
        title: 'طلب إفادة من السجل العقاري',
        description: 'الحصول على تقرير شامل من السجل العقاري حول تاريخ ملكية الأرض',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date('2025-01-22'),
        caseId: cases[0].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 7 extra task
    db.task.create({
      data: {
        title: 'مراجعة عقد الشركة الأساسي',
        description: 'دراسة عقد التأسيس واللوائح الداخلية للشركة المتنازع عليها',
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2024-09-15'),
        completedAt: new Date('2024-09-10'),
        caseId: cases[6].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 2 extra task
    db.task.create({
      data: {
        title: 'تعيين خبير خطوط',
        description: 'تقديم طلب للمحكمة لتعيين خبير خطوط لفحص التوقيعات المزيفة',
        status: 'pending',
        priority: 'high',
        dueDate: new Date('2025-02-08'),
        caseId: cases[1].id,
        lawyerId: lawyer.id,
      },
    }),
    // Case 8 extra task
    db.task.create({
      data: {
        title: 'توثيق التحويلات البنكية',
        description: 'جلب كشوف الحسابات البنكية وإثبات التحويلات المشبوهة',
        status: 'pending',
        priority: 'high',
        dueDate: new Date('2025-02-10'),
        caseId: cases[7].id,
        lawyerId: lawyer.id,
      },
    }),
    // Extra task for Case 8 - follow up
    db.task.create({
      data: {
        title: 'متابعة تحويلات البنك',
        description: 'متابعة مديرية التحقيقات الجنائية بشأن تحويلات الأموال المشبوهة',
        status: 'pending',
        priority: 'urgent',
        dueDate: new Date('2025-02-12'),
        caseId: cases[7].id,
        lawyerId: lawyer.id,
      },
    }),
  ]);
  console.log(`✅ ${tasks.length} tasks created`);

  // ─── 5. Documents ────────────────────────────────────────────────
  const documents = await Promise.all([
    db.caseDocument.create({
      data: {
        fileName: 'عقد_بيع_الأرض.pdf',
        fileType: 'pdf',
        fileSize: 2048000,
        category: 'contract',
        description: 'عقد بيع الأرض الموضوع النزاع عليه',
        uploadedAt: new Date('2024-01-20'),
        caseId: cases[0].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'صك_الملكية.pdf',
        fileType: 'pdf',
        fileSize: 1536000,
        category: 'evidence',
        description: 'صك الملكية المسجل في السجل العقاري',
        uploadedAt: new Date('2024-01-20'),
        caseId: cases[0].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'تقرير_الخبير_الجنائي.pdf',
        fileType: 'pdf',
        fileSize: 3072000,
        category: 'evidence',
        description: 'تقرير فحص التزوير من المختبرات الجنائية',
        uploadedAt: new Date('2024-12-10'),
        caseId: cases[1].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'عقد_التوريد.pdf',
        fileType: 'pdf',
        fileSize: 1280000,
        category: 'contract',
        description: 'عقد توريد مواد البناء بين الطرفين',
        uploadedAt: new Date('2024-03-15'),
        caseId: cases[2].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'كشوف_المرتبات.xlsx',
        fileType: 'other',
        fileSize: 512000,
        category: 'evidence',
        description: 'كشوف المرتبات الشهرية للموظفة',
        uploadedAt: new Date('2024-10-28'),
        caseId: cases[3].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'عقد_الزواج.pdf',
        fileType: 'pdf',
        fileSize: 768000,
        category: 'contract',
        description: 'عقد الزواج ووثيقة الطلاق',
        uploadedAt: new Date('2024-03-28'),
        caseId: cases[4].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'صك_الشراكة.pdf',
        fileType: 'pdf',
        fileSize: 2048000,
        category: 'contract',
        description: 'عقد تأسيس الشركة ووثيقة الشراكة',
        uploadedAt: new Date('2024-05-25'),
        caseId: cases[6].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'البلاغ_الرسمي.pdf',
        fileType: 'pdf',
        fileSize: 896000,
        category: 'pleading',
        description: 'بلاغ رسمي مقدم للنيابة العامة في قضية الاحتيال',
        uploadedAt: new Date('2024-07-25'),
        caseId: cases[7].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'عقد_الإيجار_التجاري.pdf',
        fileType: 'pdf',
        fileSize: 640000,
        category: 'contract',
        description: 'عقد إيجار المحل التجاري محل النزاع',
        uploadedAt: new Date('2024-06-20'),
        caseId: cases[9].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'الشيكات_المرتجعة.pdf',
        fileType: 'pdf',
        fileSize: 1152000,
        category: 'evidence',
        description: 'صور الشيكات المرتجعة من البنك',
        uploadedAt: new Date('2024-07-10'),
        caseId: cases[10].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'مذكرة_الدفاع_الأولية.docx',
        fileType: 'doc',
        fileSize: 256000,
        category: 'pleading',
        description: 'مذكرة الدفاع المقدمة في قضية الشيكات',
        uploadedAt: new Date('2024-08-05'),
        caseId: cases[10].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'تقرير_الخبير_العقاري.pdf',
        fileType: 'pdf',
        fileSize: 4096000,
        category: 'evidence',
        description: 'تقرير التقييم العقاري للأرض المتنازع عليها',
        uploadedAt: new Date('2024-02-01'),
        caseId: cases[0].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'محضر_الجلسة_2024-12.pdf',
        fileType: 'pdf',
        fileSize: 384000,
        category: 'court_order',
        description: 'محضر جلسة المحكمة بتاريخ 2024/12/15',
        uploadedAt: new Date('2024-12-16'),
        caseId: cases[1].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'طلب_النفقة_المؤقتة.pdf',
        fileType: 'pdf',
        fileSize: 320000,
        category: 'pleading',
        description: 'طلب تقديم نفقة مؤقتة للأطفال',
        uploadedAt: new Date('2024-05-28'),
        caseId: cases[4].id,
      },
    }),
    db.caseDocument.create({
      data: {
        fileName: 'كشوف_التحويلات_البنكية.pdf',
        fileType: 'pdf',
        fileSize: 1792000,
        category: 'evidence',
        description: 'كشوف الحسابات البنكية showing suspicious transfers',
        uploadedAt: new Date('2024-08-15'),
        caseId: cases[7].id,
      },
    }),
  ]);
  console.log(`✅ ${documents.length} documents created`);

  // ─── 6. Billing ──────────────────────────────────────────────────
  const billings = await Promise.all([
    db.billing.create({
      data: {
        description: 'أتعاب دراسة ملف القضية العقارية وتحضير اللائحة الأولية',
        hours: 12,
        rate: 1500,
        amount: 18000,
        currency: 'SAR',
        status: 'paid',
        invoiceDate: new Date('2024-02-01'),
        dueDate: new Date('2024-03-01'),
        paidDate: new Date('2024-02-25'),
        caseId: cases[0].id,
      },
    }),
    db.billing.create({
      data: {
        description: 'أتعاب تمثيل أمام النيابة العامة - جلسة التحقيق',
        hours: 6,
        rate: 2000,
        amount: 12000,
        currency: 'SAR',
        status: 'sent',
        invoiceDate: new Date('2024-12-20'),
        dueDate: new Date('2025-01-20'),
        caseId: cases[1].id,
      },
    }),
    db.billing.create({
      data: {
        description: 'أتعاب تدقيق عقد التوريد وإعداد مذكرة الدعوى',
        hours: 18,
        rate: 1500,
        amount: 27000,
        currency: 'SAR',
        status: 'paid',
        invoiceDate: new Date('2024-04-01'),
        dueDate: new Date('2024-05-01'),
        paidDate: new Date('2024-04-20'),
        caseId: cases[2].id,
      },
    }),
    db.billing.create({
      data: {
        description: 'أتعاب إعداد دعوى الفصل التعسفي وجمع المستندات',
        hours: 10,
        rate: 1200,
        amount: 12000,
        currency: 'SAR',
        status: 'sent',
        invoiceDate: new Date('2024-11-01'),
        dueDate: new Date('2024-12-01'),
        caseId: cases[3].id,
      },
    }),
    db.billing.create({
      data: {
        description: 'مصاريف محكمة ورسوم قضائية - قضية الحضانة',
        amount: 3500,
        currency: 'SAR',
        status: 'paid',
        invoiceDate: new Date('2024-04-01'),
        dueDate: new Date('2024-04-15'),
        paidDate: new Date('2024-04-10'),
        caseId: cases[4].id,
      },
    }),
    db.billing.create({
      data: {
        description: 'أتعاب إدارة ملف الوساطة وجلسات التفاوض',
        hours: 15,
        rate: 1800,
        amount: 27000,
        currency: 'SAR',
        status: 'draft',
        caseId: cases[6].id,
      },
    }),
    db.billing.create({
      data: {
        description: 'أتعاب تقديم البلاغ وجمع الأدلة الرقمية',
        hours: 20,
        rate: 2000,
        amount: 40000,
        currency: 'SAR',
        status: 'sent',
        invoiceDate: new Date('2024-08-10'),
        dueDate: new Date('2024-09-10'),
        caseId: cases[7].id,
      },
    }),
    db.billing.create({
      data: {
        description: 'أتعاب المرافعة في قضية الشيكات المرتجعة',
        hours: 8,
        rate: 2000,
        amount: 16000,
        currency: 'SAR',
        status: 'overdue',
        invoiceDate: new Date('2024-09-01'),
        dueDate: new Date('2024-10-01'),
        caseId: cases[10].id,
      },
    }),
    db.billing.create({
      data: {
        description: 'أتعاب تحضير مذكرة الدفاع - قضية التحصيل',
        hours: 14,
        rate: 1200,
        amount: 16800,
        currency: 'SAR',
        status: 'paid',
        invoiceDate: new Date('2023-07-01'),
        dueDate: new Date('2023-08-01'),
        paidDate: new Date('2023-07-25'),
        caseId: cases[5].id,
      },
    }),
    db.billing.create({
      data: {
        description: 'رسوم طلب تعيين خبير عقاري ومصاريف محكمة',
        amount: 5000,
        currency: 'SAR',
        status: 'draft',
        caseId: cases[9].id,
      },
    }),
  ]);
  console.log(`✅ ${billings.length} billing entries created`);

  // ─── 7. Timeline Events ──────────────────────────────────────────
  const timelineEvents = await Promise.all([
    db.timelineEvent.create({
      data: {
        title: 'تقديم الدعوى',
        description: 'تم تقديم صحيفة الدعوى إلى المحكمة العامة بالرياض',
        eventType: 'filing',
        eventDate: new Date('2024-01-15'),
        caseId: cases[0].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'أول جلسة محاكمة',
        description: 'عُقدت الجلسة الأولى وتم تأجيل القضية لجلب المستندات',
        eventType: 'hearing',
        eventDate: new Date('2024-02-20'),
        caseId: cases[0].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'تقديم بلاغ للنيابة',
        description: 'تم تقديم بلاغ رسمي للنيابة العامة في قضية التزوير',
        eventType: 'filing',
        eventDate: new Date('2024-02-25'),
        caseId: cases[1].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'تحويل القضية للتحقيق',
        description: 'تم تحويل القضية من النيابة العامة لبدء التحقيق',
        eventType: 'status_change',
        eventDate: new Date('2024-04-01'),
        caseId: cases[1].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'تقديم دعوى تجارية',
        description: 'تم رفع دعوى تعويض عن الإخلال بعقد التوريد',
        eventType: 'filing',
        eventDate: new Date('2024-03-10'),
        caseId: cases[2].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'موعد نهائي لتقديم الأدلة',
        description: 'آخر موعد لتقديم المستندات والادلة المؤيدة للدعوى',
        eventType: 'deadline',
        eventDate: new Date('2025-02-01'),
        caseId: cases[2].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'صدور حكم المحكمة',
        description: 'حكمت المحكمة لصالح الموكل بمبلغ 750,000 ريال',
        eventType: 'status_change',
        eventDate: new Date('2024-08-15'),
        caseId: cases[5].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'بدء جلسات الوساطة',
        description: 'عُقدت أول جلسة وساطة بين شركاء الشركة المتنازعين',
        eventType: 'hearing',
        eventDate: new Date('2024-08-15'),
        caseId: cases[6].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'إيداع مبلغ التأمين',
        description: 'تم إيداع مبلغ التأمين القضائي في حساب المحكمة',
        eventType: 'payment',
        eventDate: new Date('2024-03-20'),
        caseId: cases[4].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'صدور أمر المحكمة بالحضانة المؤقتة',
        description: 'أصدرت المحكمة أولاً بحضانة الأم مع نفقة شهرية',
        eventType: 'document',
        eventDate: new Date('2024-06-15'),
        caseId: cases[4].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'رفع دعوى عمالية',
        description: 'تم تقديم الدعوى لمحكمة العمل بالدمام',
        eventType: 'filing',
        eventDate: new Date('2024-04-05'),
        caseId: cases[3].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'تقديم الأدلة الرقمية',
        description: 'تم تقديم الأدلة الإلكترونية المجمعة للنيابة العامة',
        eventType: 'document',
        eventDate: new Date('2024-09-01'),
        caseId: cases[7].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'جلسة المرافعة',
        description: 'جلسة مرافعة في قضية الشيكات المرتجعة - تقديم الدفاع',
        eventType: 'hearing',
        eventDate: new Date('2024-10-15'),
        caseId: cases[10].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'تسوية ودية',
        description: 'تم التوصل إلى تسوية ودية بين الطرفين بقيمة متفق عليها',
        eventType: 'status_change',
        eventDate: new Date('2024-03-15'),
        caseId: cases[8].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'تقديم تقرير الخبير العقاري',
        description: 'تم تقديم تقرير تقييم الأرض من مكتب الخبراء المعتمد',
        eventType: 'document',
        eventDate: new Date('2024-12-01'),
        caseId: cases[0].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'إشعار الجلسة القادمة',
        description: 'تم تلقي إشعار بموعد الجلسة القادمة في قضية الإيجار',
        eventType: 'hearing',
        eventDate: new Date('2025-01-15'),
        caseId: cases[9].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'تحصيل مبلغ الحكم',
        description: 'تم تحصيل مبلغ الحكم كاملاً من المحكوم عليه',
        eventType: 'payment',
        eventDate: new Date('2024-09-01'),
        caseId: cases[5].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'تقديم مذكمة دفع بعدم الاختصاص',
        description: 'تم تقديم مذكرة دفع بعدم اختصاص المحكمة بنظر النزاع',
        eventType: 'filing',
        eventDate: new Date('2024-07-10'),
        caseId: cases[10].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'موعد نهائي للرد',
        description: 'آخر موعد لتقديم الرد على مذكرة المدعي',
        eventType: 'deadline',
        eventDate: new Date('2025-01-25'),
        caseId: cases[1].id,
      },
    }),
    db.timelineEvent.create({
      data: {
        title: 'تقرير الصلح والصلح المالي',
        description: 'تم إنهاء القضية بالصلح وتم صرف مستحقات الموظف',
        eventType: 'payment',
        eventDate: new Date('2024-03-20'),
        caseId: cases[8].id,
      },
    }),
  ]);
  console.log(`✅ ${timelineEvents.length} timeline events created`);

  // ─── 8. Activity Log ─────────────────────────────────────────────
  const activities = await Promise.all([
    db.activity.create({
      data: {
        action: 'case_created',
        description: 'تم إنشاء قضية نزاع عقاري جديدة',
        entity: 'case',
        entityId: cases[0].id,
        lawyerId: lawyer.id,
        caseId: cases[0].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'document_uploaded',
        description: 'تم رفع عقد بيع الأرض',
        entity: 'document',
        entityId: documents[0].id,
        lawyerId: lawyer.id,
        caseId: cases[0].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'task_completed',
        description: 'تم إكمال مراجعة تقرير الخبير الجنائي',
        entity: 'task',
        entityId: tasks[3].id,
        lawyerId: lawyer.id,
        caseId: cases[1].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'case_status_changed',
        description: 'تم تغيير حالة قضية التحصيل إلى "مغلق"',
        entity: 'case',
        entityId: cases[5].id,
        lawyerId: lawyer.id,
        caseId: cases[5].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'invoice_sent',
        description: 'تم إرسال فاتورة أتعاب المرافعة',
        entity: 'billing',
        entityId: billings[1].id,
        lawyerId: lawyer.id,
        caseId: cases[1].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'task_created',
        description: 'تم إضافة مهمة تحضير مذكرة الدفاع',
        entity: 'task',
        entityId: tasks[0].id,
        lawyerId: lawyer.id,
        caseId: cases[0].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'hearing_scheduled',
        description: 'تم تحديد موعد جلسة جديدة في قضية التوريد',
        entity: 'case',
        entityId: cases[2].id,
        lawyerId: lawyer.id,
        caseId: cases[2].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'client_added',
        description: 'تم إضافة عميل جديد: شركة النور للتجارة',
        entity: 'client',
        entityId: clients[1].id,
        lawyerId: lawyer.id,
      },
    }),
    db.activity.create({
      data: {
        action: 'document_uploaded',
        description: 'تم رفع تقرير الخبير العقاري',
        entity: 'document',
        entityId: documents[11].id,
        lawyerId: lawyer.id,
        caseId: cases[0].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'settlement_reached',
        description: 'تم التوصل إلى تسوية في قضية الشراكة التجارية',
        entity: 'case',
        entityId: cases[6].id,
        lawyerId: lawyer.id,
        caseId: cases[6].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'case_created',
        description: 'تم إنشاء قضية احتيال إلكتروني جديدة',
        entity: 'case',
        entityId: cases[7].id,
        lawyerId: lawyer.id,
        caseId: cases[7].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'task_completed',
        description: 'تم إكمال تقديم البلاغ للنيابة العامة',
        entity: 'task',
        entityId: tasks[12].id,
        lawyerId: lawyer.id,
        caseId: cases[7].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'invoice_paid',
        description: 'تم استلام دفعة فاتورة قضية التحصيل',
        entity: 'billing',
        entityId: billings[8].id,
        lawyerId: lawyer.id,
        caseId: cases[5].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'case_status_changed',
        description: 'تم تحويل قضية الشيكات إلى مرحلة المحاكمة',
        entity: 'case',
        entityId: cases[10].id,
        lawyerId: lawyer.id,
        caseId: cases[10].id,
      },
    }),
    db.activity.create({
      data: {
        action: 'task_created',
        description: 'تم إضافة مهمة طلب تعيين خبير خطوط',
        entity: 'task',
        entityId: tasks[24].id,
        lawyerId: lawyer.id,
        caseId: cases[1].id,
      },
    }),
  ]);
  console.log(`✅ ${activities.length} activity log entries created`);

  // ─── 9. Feature Flags ────────────────────────────────────────────
  const featureFlags = await Promise.all([
    db.featureFlag.create({
      data: {
        key: 'pro_dashboard',
        label: 'Pro Dashboard',
        description: 'لوحة تحكم متقدمة مع إحصائيات شاملة وتقارير تفصيلية',
        enabled: true,
      },
    }),
    db.featureFlag.create({
      data: {
        key: 'advanced_analytics',
        label: 'Advanced Analytics',
        description: 'تحليلات متقدمة للقضايا والإيرادات والأداء',
        enabled: true,
      },
    }),
    db.featureFlag.create({
      data: {
        key: 'ai_assist',
        label: 'AI Legal Assistant',
        description: 'مساعد قانوني ذكي يعمل بالذكاء الاصطناعي لمساعدة المحامي',
        enabled: false,
      },
    }),
    db.featureFlag.create({
      data: {
        key: 'client_portal_sync',
        label: 'Client Portal Sync',
        description: 'مزامنة فورية مع بوابة العميل لتحديث المعلومات تلقائياً',
        enabled: true,
      },
    }),
    db.featureFlag.create({
      data: {
        key: 'bulk_operations',
        label: 'Bulk Operations',
        description: 'إمكانية تنفيذ عمليات جماعية على القضايا والمهام والمستندات',
        enabled: false,
      },
    }),
  ]);
  console.log(`✅ ${featureFlags.length} feature flags created`);

  // ─── Summary ─────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════');
  console.log('  ✨ Wakeely Pro Database Seeded Successfully!');
  console.log('═══════════════════════════════════════════════');
  console.log(`  👤 Lawyer:       1`);
  console.log(`  👥 Clients:      ${clients.length}`);
  console.log(`  📋 Cases:        ${cases.length}`);
  console.log(`  ✅ Tasks:        ${tasks.length}`);
  console.log(`  📄 Documents:    ${documents.length}`);
  console.log(`  💰 Billings:     ${billings.length}`);
  console.log(`  📅 Timeline:     ${timelineEvents.length}`);
  console.log(`  📝 Activities:   ${activities.length}`);
  console.log(`  🚩 Feature Flags: ${featureFlags.length}`);
  console.log('═══════════════════════════════════════════════\n');
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await db.$disconnect();
    process.exit(1);
  });