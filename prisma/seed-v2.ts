import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding Wakeely Pro database (v2)...\n');

  // ─── Clean existing data (order matters for FK constraints) ──────
  console.log('🗑️  Cleaning existing data...');
  try { await db.privilegeLog.deleteMany(); } catch {}
  try { await db.evidenceItem.deleteMany(); } catch {}
  try { await db.calendarEvent.deleteMany(); } catch {}
  try { await db.expense.deleteMany(); } catch {}
  try { await db.timeEntry.deleteMany(); } catch {}
  try { await db.comment.deleteMany(); } catch {}
  try { await db.caseParty.deleteMany(); } catch {}
  try { await db.taskAssignment.deleteMany(); } catch {}
  try { await db.activity.deleteMany(); } catch {}
  try { await db.timelineEvent.deleteMany(); } catch {}
  try { await db.billing.deleteMany(); } catch {}
  try { await db.caseDocument.deleteMany(); } catch {}
  try { await db.task.deleteMany(); } catch {}
  try { await db.case.deleteMany(); } catch {}
  try { await db.client.deleteMany(); } catch {}
  try { await db.teamMember.deleteMany(); } catch {}
  try { await db.lawyer.deleteMany(); } catch {}
  try { await db.featureFlag.deleteMany(); } catch {}
  console.log('✅ Database cleaned');

  // ─── 1. Feature Flags ────────────────────────────────────────────
  console.log('\n🚩 Seeding feature flags...');
  try {
    const ff1 = await db.featureFlag.create({ data: { key: 'pro_dashboard', label: 'Pro Dashboard', description: 'لوحة تحكم متقدمة مع إحصائيات شاملة وتقارير تفصيلية', enabled: true } });
    const ff2 = await db.featureFlag.create({ data: { key: 'advanced_analytics', label: 'Advanced Analytics', description: 'تحليلات متقدمة للقضايا والإيرادات والأداء', enabled: true } });
    const ff3 = await db.featureFlag.create({ data: { key: 'ai_assist', label: 'AI Legal Assistant', description: 'مساعد قانوني ذكي يعمل بالذكاء الاصطناعي لمساعدة المحامي', enabled: false } });
    const ff4 = await db.featureFlag.create({ data: { key: 'client_portal_sync', label: 'Client Portal Sync', description: 'مزامنة فورية مع بوابة العميل لتحديث المعلومات تلقائياً', enabled: true } });
    const ff5 = await db.featureFlag.create({ data: { key: 'bulk_operations', label: 'Bulk Operations', description: 'إمكانية تنفيذ عمليات جماعية على القضايا والمهام والمستندات', enabled: false } });
    console.log(`✅ 5 feature flags created`);
  } catch (e) { console.error('❌ Feature flags error:', e); }

  // ─── 2. Lawyer ───────────────────────────────────────────────────
  console.log('\n👤 Seeding lawyer...');
  let lawyerId = '';
  try {
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
    lawyerId = lawyer.id;
    console.log(`✅ Lawyer created: ${lawyer.name} (${lawyer.email})`);
  } catch (e) { console.error('❌ Lawyer error:', e); }

  // ─── 3. Team Members ────────────────────────────────────────────
  console.log('\n👥 Seeding team members...');
  const teamIds: string[] = [];
  try {
    const tm1 = await db.teamMember.create({ data: { name: 'خالد بن سعود الدوسري', email: 'khaled@wakeely.pro', role: 'partner', specialization: 'القانون التجاري', phone: '+966501112233', barNumber: 'SA-BAR-2019-00112', isActive: true } });
    const tm2 = await db.teamMember.create({ data: { name: 'سارة بنت أحمد الشهري', email: 'sara@wakeely.pro', role: 'senior_associate', specialization: 'قانون الأسرة', phone: '+966502223344', barNumber: 'SA-BAR-2020-00345', isActive: true } });
    const tm3 = await db.teamMember.create({ data: { name: 'يوسف بن إبراهيم العنزي', email: 'yousef@wakeely.pro', role: 'associate', specialization: 'القانون الجنائي', phone: '+966503334455', barNumber: 'SA-BAR-2021-00567', isActive: true } });
    const tm4 = await db.teamMember.create({ data: { name: 'نورة بنت محمد القحطاني', email: 'noura@wakeely.pro', role: 'paralegal', phone: '+966504445566', isActive: true } });
    const tm5 = await db.teamMember.create({ data: { name: 'أحمد بن فهد المالكي', email: 'ahmed@wakeely.pro', role: 'trainee', phone: '+966505556677', isActive: true } });
    teamIds.push(tm1.id, tm2.id, tm3.id, tm4.id, tm5.id);
    console.log(`✅ 5 team members created`);
  } catch (e) { console.error('❌ Team members error:', e); }

  // ─── 4. Clients ─────────────────────────────────────────────────
  console.log('\n📋 Seeding clients...');
  const clientIds: string[] = [];
  try {
    const c1 = await db.client.create({ data: { fullName: 'محمد بن خالد الراشدي', email: 'mohammed.alrashidi@email.com', phone: '+966551112233', nationalId: '1098765432', address: 'الرياض، حي الملقا، شارع الأمير سلطان', type: 'individual' } });
    const c2 = await db.client.create({ data: { fullName: 'فاطمة بنت عبدالرحمن القحطاني', email: 'fatima.qahtani@email.com', phone: '+966504445566', nationalId: '1087654321', address: 'الدمام، حي الشاطئ، شارع الملك فهد', type: 'individual' } });
    const c3 = await db.client.create({ data: { fullName: 'سلطان بن فهد العتيبي', email: 'sultan.otaybi@email.com', phone: '+966507778899', nationalId: '1076543210', address: 'مكة المكرمة، حي العزيزية', type: 'individual' } });
    const c4 = await db.client.create({ data: { fullName: 'شركة النور للتجارة', email: 'info@alnoor-trade.com', phone: '+966112345678', address: 'جدة، حي الحمراء، طريق المدينة', company: 'شركة النور للتجارة', type: 'corporate' } });
    const c5 = await db.client.create({ data: { fullName: 'شركة البناء المتقدم المحدودة', email: 'legal@advanced-build.com', phone: '+966133456789', address: 'الرياض، حي العليا، شارع التحلية', company: 'شركة البناء المتقدم المحدودة', type: 'corporate' } });
    clientIds.push(c1.id, c2.id, c3.id, c4.id, c5.id);
    console.log(`✅ 5 clients created`);
  } catch (e) { console.error('❌ Clients error:', e); }

  // ─── 5. Cases ───────────────────────────────────────────────────
  console.log('\n📁 Seeding cases...');
  const caseIds: string[] = [];
  const caseNumbers: string[] = [];
  try {
    const caseData = [
      { caseNumber: 'CIV-2024-001', title: 'نزاع عقاري على أرض في شمال الرياض', description: 'نزاع بين الطرفين حول ملكية أرض زراعية مساحتها 5000 متر مربع في منطقة شمال الرياض. يدعي المدعي حق الملكية بناءً على عقد بيع قديم.', caseType: 'real_estate', status: 'active', priority: 'high', court: 'المحكمة العامة بالرياض', jurisdiction: 'المحكمة العامة بالرياض', judge: 'القاضي أحمد الشمري', opposingCounsel: 'المحامي ماجد السبيعي', filedDate: new Date('2024-01-15'), nextHearing: new Date('2025-02-10'), statuteLimitDate: new Date('2027-01-15'), value: 2500000, notes: 'يحتاج إلى تحديث مستندات الملكية من البلدية', isPro: true, isVisibleToClient: true, clientId: 0 },
      { caseNumber: 'CRM-2024-002', title: 'قضية تزوير مستندات تجارية', description: 'اتهام بالتزوير في مستندات تجارية وتوقيعات مزيفة على عقود بيع. القضية معروضة على النيابة العامة للتحقيق.', caseType: 'criminal', status: 'discovery', priority: 'urgent', court: 'المحكمة الجزائية بالرياض', jurisdiction: 'النيابة العامة بالرياض', judge: 'القاضي فيصل الدوسري', opposingCounsel: 'النيابة العامة - مكتب الادعاء', filedDate: new Date('2024-02-20'), nextHearing: new Date('2025-01-28'), statuteLimitDate: new Date('2027-02-20'), value: 500000, isPro: true, isVisibleToClient: false, clientId: 3 },
      { caseNumber: 'COM-2024-003', title: 'نزاع عقد توريد مواد بناء', description: 'نزاع تجاري بين شركة النور للتجارة ومقاول بشأن عقد توريد مواد بناء. الطرف الأول يطالب بتعويض عن تأخير التسليم.', caseType: 'commercial', status: 'active', priority: 'high', court: 'المحكمة التجارية بالرياض', jurisdiction: 'المحكمة التجارية بالرياض', judge: 'القاضي سعد الحربي', opposingCounsel: 'المحامي عبدالرحمن الغامدي', filedDate: new Date('2024-03-10'), nextHearing: new Date('2025-02-15'), statuteLimitDate: new Date('2027-03-10'), value: 1800000, isPro: true, isVisibleToClient: true, clientId: 3 },
      { caseNumber: 'LAB-2024-004', title: 'دعوى تعويض عن فصل تعسفي', description: 'دعوى مقامة من الموظفة فاطمة القحطاني ضد شركة سابقة للمطالبة بتعويض عن الفصل التعسفي وعدم صرف مستحقات نهاية الخدمة.', caseType: 'labor', status: 'active', priority: 'medium', court: 'محكمة العمل بالدمام', jurisdiction: 'محكمة العمل بالدمام', judge: 'القاضي عبدالعزيز المطيري', opposingCounsel: 'المحامية هدى الزيلعي', filedDate: new Date('2024-04-05'), nextHearing: new Date('2025-02-20'), statuteLimitDate: new Date('2027-04-05'), value: 350000, isPro: true, isVisibleToClient: true, clientId: 1 },
      { caseNumber: 'FAM-2024-005', title: 'دعوى حضانة ونفقة أطفال', description: 'دعوى مطالبة بحضانة الأطفال الثلاثة ونفقة شهرية. يتضمن النزاع تحديد مكان إقامة الأطفال وحق الزيارة.', caseType: 'family', status: 'active', priority: 'high', court: 'محكمة الأحوال الشخصية بالرياض', jurisdiction: 'محكمة الأحوال الشخصية بالرياض', judge: 'القاضي محمد العنزي', opposingCounsel: 'المحامي تركي الحربي', filedDate: new Date('2024-03-25'), nextHearing: new Date('2025-02-05'), statuteLimitDate: new Date('2026-03-25'), value: 0, notes: 'قضية حساسة تحتاج تعامل دقيق', isPro: true, isVisibleToClient: true, clientId: 1 },
      { caseNumber: 'CIV-2023-006', title: 'قضية تحصيل دين تجاري', description: 'قضية تحصيل دين مستحق لشركة البناء المتقدم من عميل سابق بقيمة 750,000 ريال. تم الحكم لصالح الموكل.', caseType: 'civil', status: 'closed', priority: 'medium', court: 'المحكمة العامة بالرياض', jurisdiction: 'المحكمة العامة بالرياض', judge: 'القاضي خالد العمري', opposingCounsel: 'المحامي ناصر الشمري', filedDate: new Date('2023-06-10'), closedDate: new Date('2024-08-15'), value: 750000, isPro: false, isVisibleToClient: true, clientId: 4 },
      { caseNumber: 'COM-2024-007', title: 'نزاع شراكة تجارية بين شركاء', description: 'نزاع بين شركاء في شركة تجارية حول توزيع الأرباح وإدارة الشركة. يتم التحضير لعرض الوساطة.', caseType: 'commercial', status: 'settlement', priority: 'high', court: 'مركز الوساطة التجاري بالرياض', jurisdiction: 'المحكمة التجارية بالرياض', judge: 'المُوَسِّط ناصر السبيعي', opposingCounsel: 'المحامي فهد العتيبي', filedDate: new Date('2024-05-20'), statuteLimitDate: new Date('2027-05-20'), value: 5000000, isPro: true, isVisibleToClient: false, clientId: 4 },
      { caseNumber: 'CRM-2024-008', title: 'قضية احتيال إلكتروني', description: 'قضية احتيال عبر منصة إلكترونية حيث تم تحويل مبالغ مالية بطريقة الاحتيال. تم تقديم بلاغ للنيابة العامة.', caseType: 'criminal', status: 'intake', priority: 'urgent', court: 'النيابة العامة - الفرع الإلكتروني', jurisdiction: 'النيابة العامة بالرياض', value: 1200000, isPro: true, isVisibleToClient: false, clientId: 2 },
      { caseNumber: 'LAB-2023-009', title: 'دعوى مطالبة بمستحقات عمالية', description: 'دعوى لموظف سابق للمطالبة ببدلات سفر ومكافآت نهاية العام غير المصروفة. تم الصلح بين الطرفين.', caseType: 'labor', status: 'closed', priority: 'low', court: 'محكمة العمل بالرياض', jurisdiction: 'محكمة العمل بالرياض', judge: 'القاضي عبدالإله الزهراني', opposingCounsel: 'المحامي سعد المطيري', filedDate: new Date('2023-09-01'), closedDate: new Date('2024-03-20'), value: 95000, isPro: false, isVisibleToClient: true, clientId: 0 },
      { caseNumber: 'RLE-2024-010', title: 'نزاع عقد إيجار تجاري', description: 'نزاع بين مؤجر ومستأجر حول شروط عقد إيجار محل تجاري. المستأجر يدعي عدم صيانة المبنى والمؤجر يطالب ببدل إيجار متأخر.', caseType: 'real_estate', status: 'active', priority: 'medium', court: 'محكمة التنفيذ بالرياض', jurisdiction: 'محكمة التنفيذ بالرياض', judge: 'القاضي بندر الرشيدي', opposingCounsel: 'المحامي مشعل القحطاني', filedDate: new Date('2024-06-15'), nextHearing: new Date('2025-03-01'), statuteLimitDate: new Date('2027-06-15'), value: 420000, isPro: true, isVisibleToClient: true, clientId: 2 },
      { caseNumber: 'CRM-2024-011', title: 'قضية شيكات مرتجعة', description: 'مقاضاة بسبب صدور شيكات بدون رصيد كافٍ. القضية في مرحلة المحاكمة وتم تقديم أدلة الثبوت.', caseType: 'criminal', status: 'trial', priority: 'high', court: 'المحكمة الجزائية بالرياض', jurisdiction: 'المحكمة الجزائية بالرياض', judge: 'القاضي فيصل الدوسري', opposingCounsel: 'النيابة العامة - فرع الرياض', filedDate: new Date('2024-07-01'), nextHearing: new Date('2025-01-30'), statuteLimitDate: new Date('2027-07-01'), value: 380000, isPro: true, isVisibleToClient: true, clientId: 3 },
      { caseNumber: 'CIV-2023-012', title: 'دعوى تعويض عن حادث مروري', description: 'دعوى تعويض عن أضرار مادية وجسدية ناتجة عن حادث مروري. تم الحكم بالتعويض وإغلاق القضية.', caseType: 'civil', status: 'archived', priority: 'low', court: 'المحكمة العامة بالرياض', jurisdiction: 'محكمة التنفيذ بالرياض', judge: 'القاضي خالد العمري', opposingCounsel: 'المحامي عبدالله الزهراني', filedDate: new Date('2023-02-15'), closedDate: new Date('2024-01-10'), value: 200000, isPro: false, isVisibleToClient: true, clientId: 0 },
    ];

    for (const cd of caseData) {
      const c = await db.case.create({
        data: {
          caseNumber: cd.caseNumber,
          title: cd.title,
          description: cd.description,
          caseType: cd.caseType,
          status: cd.status,
          priority: cd.priority,
          court: cd.court,
          jurisdiction: cd.jurisdiction,
          judge: cd.judge,
          opposingCounsel: cd.opposingCounsel,
          filedDate: cd.filedDate,
          nextHearing: cd.nextHearing,
          statuteLimitDate: cd.statuteLimitDate,
          closedDate: cd.closedDate,
          value: cd.value,
          currency: 'SAR',
          notes: cd.notes,
          isPro: cd.isPro,
          isVisibleToClient: cd.isVisibleToClient,
          lawyerId: lawyerId,
          clientId: clientIds[cd.clientId],
        },
      });
      caseIds.push(c.id);
      caseNumbers.push(c.caseNumber);
    }
    console.log(`✅ ${caseIds.length} cases created`);
  } catch (e) { console.error('❌ Cases error:', e); }

  // ─── 6. Tasks (25 with category) ────────────────────────────────
  console.log('\n✅ Seeding tasks...');
  let taskCount = 0;
  try {
    const taskData = [
      // Case 0 tasks
      { title: 'تحضير مذكرة دفاع أولية', description: 'إعداد مذكرة الدفاع حول ملكية الأرض مع إرفاق كافة المستندات المؤيدة', status: 'in_progress', priority: 'high', dueDate: '2025-01-25', caseIdx: 0, category: 'drafting' },
      { title: 'جلب مستندات البلدية', description: 'استخراج صورة من مخطط الأرض وشهادة الملكية من أمانة الرياض', status: 'pending', priority: 'medium', dueDate: '2025-01-20', caseIdx: 0, category: 'filing' },
      { title: 'مقابلة الشهود', description: 'تحديد مواعيد لمقابلة شهود الإثبات وتدوين أقوالهم', status: 'pending', priority: 'high', dueDate: '2025-02-01', caseIdx: 0, category: 'meeting' },
      // Case 1 tasks
      { title: 'مراجعة تقرير الخبير الجنائي', description: 'دراسة تقرير التزوير المقدم من الإدارة العامة للمختبرات الجنائية', status: 'completed', priority: 'urgent', dueDate: '2024-12-15', completedAt: '2024-12-14', caseIdx: 1, category: 'review' },
      { title: 'تحضير أسئلة للنيابة العامة', description: 'إعداد قائمة أسئلة للتحقيق مع المتهم في النيابة العامة', status: 'in_progress', priority: 'urgent', dueDate: '2025-01-27', caseIdx: 1, category: 'drafting' },
      // Case 2 tasks
      { title: 'تدقيق عقد التوريد', description: 'مراجعة كافة بنود عقد التوريد وتحديد مخالفات الطرف الثاني', status: 'completed', priority: 'high', dueDate: '2024-10-01', completedAt: '2024-09-28', caseIdx: 2, category: 'review' },
      { title: 'حساب قيمة التعويض المطلوب', description: 'حساب الخسائر الفعلية والتعويض عن الأضرار المباشرة وغير المباشرة', status: 'in_progress', priority: 'medium', dueDate: '2025-02-10', caseIdx: 2, category: 'research' },
      // Case 3 tasks
      { title: 'جمع كشوف المرتبات', description: 'الحصول على كشوف المرتبات الشهرية للموظفة من الشركة المدعى عليها', status: 'completed', priority: 'medium', dueDate: '2024-11-01', completedAt: '2024-10-30', caseIdx: 3, category: 'filing' },
      { title: 'تحضير طلب صندوق تنمية الموارد البشرية', description: 'تقديم طلب للحصول على بيانات من صندوق تنمية الموارد البشرية (هدف)', status: 'pending', priority: 'medium', dueDate: '2025-02-15', caseIdx: 3, category: 'filing' },
      // Case 4 tasks
      { title: 'إعداد قائمة بحاجات الأطفال', description: 'توثيق كافة احتياجات الأطفال المادية والمعنوية لتقديمها للمحكمة', status: 'in_progress', priority: 'high', dueDate: '2025-02-03', caseIdx: 4, category: 'drafting' },
      { title: 'تعيين محامي للأطفال', description: 'تقديم طلب لتعيين محامي خاص يمثل مصالح الأطفال في القضية', status: 'pending', priority: 'high', dueDate: '2025-01-30', caseIdx: 4, category: 'court' },
      // Case 6 tasks
      { title: 'تجهيز ملف الوساطة', description: 'إعداد ملخص النزاع ووثائق الشراكة لتقديمها لمركز الوساطة', status: 'in_progress', priority: 'high', dueDate: '2025-02-12', caseIdx: 6, category: 'filing' },
      { title: 'حساب حصص الأرباح', description: 'مراجعة السجلات المالية للشركة وحساب حصة كل شريك من الأرباح', status: 'pending', priority: 'medium', dueDate: '2025-02-18', caseIdx: 6, category: 'research' },
      // Case 7 tasks
      { title: 'تقديم بلاغ للنيابة العامة', description: 'إعداد وتقديم بلاغ رسمي للنيابة العامة مع إرفاق الأدلة الرقمية', status: 'completed', priority: 'urgent', dueDate: '2024-08-01', completedAt: '2024-07-28', caseIdx: 7, category: 'filing' },
      { title: 'جمع الأدلة الرقمية', description: 'التنسيق مع فريق الأمن السيبراني لجمع وتأمين الأدلة الإلكترونية', status: 'in_progress', priority: 'urgent', dueDate: '2025-02-05', caseIdx: 7, category: 'research' },
      // Case 9 tasks
      { title: 'مراجعة عقد الإيجار', description: 'تحليل بنود عقد الإيجار وتحديد الالتزامات المترتبة على كل طرف', status: 'completed', priority: 'medium', dueDate: '2024-11-15', completedAt: '2024-11-12', caseIdx: 9, category: 'review' },
      { title: 'تقرير خبير عقاري', description: 'طلب تعيين خبير عقاري لتقييم حالة المبنى وتحديد تكاليف الصيانة', status: 'pending', priority: 'medium', dueDate: '2025-02-25', caseIdx: 9, category: 'court' },
      // Case 10 tasks
      { title: 'إعداد مذكرة الرد على الادعاء', description: 'تحضير مذكرة قانونية للرد على ادعاءات المدعي العام في قضية الشيكات', status: 'in_progress', priority: 'high', dueDate: '2025-01-28', caseIdx: 10, category: 'drafting' },
      // Extra tasks
      { title: 'توثيق شهادات الزملاء السابقين', description: 'جمع شهادات من زملاء العمل السابقين حول ظروف الفصل', status: 'pending', priority: 'low', dueDate: '2025-03-01', caseIdx: 3, category: 'other' },
      { title: 'تقديم طلب نفقة مؤقتة', description: 'إعداد وتقديم طلب للنفقة المؤقتة ريثما يتم البت في القضية', status: 'completed', priority: 'high', dueDate: '2024-06-01', completedAt: '2024-05-29', caseIdx: 4, category: 'filing' },
      { title: 'طلب إفادة من السجل العقاري', description: 'الحصول على تقرير شامل من السجل العقاري حول تاريخ ملكية الأرض', status: 'in_progress', priority: 'medium', dueDate: '2025-01-22', caseIdx: 0, category: 'filing' },
      { title: 'مراجعة عقد الشركة الأساسي', description: 'دراسة عقد التأسيس واللوائح الداخلية للشركة المتنازع عليها', status: 'completed', priority: 'high', dueDate: '2024-09-15', completedAt: '2024-09-10', caseIdx: 6, category: 'review' },
      { title: 'تعيين خبير خطوط', description: 'تقديم طلب للمحكمة لتعيين خبير خطوط لفحص التوقيعات المزيفة', status: 'pending', priority: 'high', dueDate: '2025-02-08', caseIdx: 1, category: 'court' },
      { title: 'توثيق التحويلات البنكية', description: 'جلب كشوف الحسابات البنكية وإثبات التحويلات المشبوهة', status: 'pending', priority: 'high', dueDate: '2025-02-10', caseIdx: 7, category: 'filing' },
      { title: 'متابعة تحويلات البنك', description: 'متابعة مديرية التحقيقات الجنائية بشأن تحويلات الأموال المشبوهة', status: 'pending', priority: 'urgent', dueDate: '2025-02-12', caseIdx: 7, category: 'other' },
    ];

    for (const td of taskData) {
      await db.task.create({
        data: {
          title: td.title,
          description: td.description,
          status: td.status,
          priority: td.priority,
          dueDate: td.dueDate ? new Date(td.dueDate) : undefined,
          completedAt: td.completedAt ? new Date(td.completedAt) : undefined,
          category: td.category,
          caseId: caseIds[td.caseIdx],
          lawyerId: lawyerId,
        },
      });
      taskCount++;
    }
    console.log(`✅ ${taskCount} tasks created`);
  } catch (e) { console.error('❌ Tasks error:', e); }

  // ─── 7. Documents (15 with folder and tags) ─────────────────────
  console.log('\n📄 Seeding documents...');
  let docCount = 0;
  try {
    const docData = [
      { fileName: 'عقد_بيع_الأرض.pdf', fileType: 'pdf', fileSize: 2048000, category: 'contract', description: 'عقد بيع الأرض الموضوع النزاع عليه', folder: '/', tags: JSON.stringify(['عقد', 'ملكية', 'أصل']), caseIdx: 0 },
      { fileName: 'صك_الملكية.pdf', fileType: 'pdf', fileSize: 1536000, category: 'evidence', description: 'صك الملكية المسجل في السجل العقاري', folder: '/أدلة', tags: JSON.stringify(['صك', 'سجل عقاري']), caseIdx: 0 },
      { fileName: 'تقرير_الخبير_الجنائي.pdf', fileType: 'pdf', fileSize: 3072000, category: 'evidence', description: 'تقرير فحص التزوير من المختبرات الجنائية', folder: '/أدلة', tags: JSON.stringify(['تقرير', 'تزوير', 'خبير']), caseIdx: 1 },
      { fileName: 'عقد_التوريد.pdf', fileType: 'pdf', fileSize: 1280000, category: 'contract', description: 'عقد توريد مواد البناء بين الطرفين', folder: '/', tags: JSON.stringify(['عقد', 'توريد', 'تجاري']), caseIdx: 2 },
      { fileName: 'كشوف_المرتبات.xlsx', fileType: 'other', fileSize: 512000, category: 'evidence', description: 'كشوف المرتبات الشهرية للموظفة', folder: '/أدلة', tags: JSON.stringify(['مرتبات', 'عمالية']), caseIdx: 3 },
      { fileName: 'عقد_الزواج.pdf', fileType: 'pdf', fileSize: 768000, category: 'contract', description: 'عقد الزواج ووثيقة الطلاق', folder: '/', tags: JSON.stringify(['زواج', 'أحوال شخصية']), caseIdx: 4, isConfidential: true },
      { fileName: 'صك_الشراكة.pdf', fileType: 'pdf', fileSize: 2048000, category: 'contract', description: 'عقد تأسيس الشركة ووثيقة الشراكة', folder: '/', tags: JSON.stringify(['شراكة', 'تأسيس']), caseIdx: 6 },
      { fileName: 'البلاغ_الرسمي.pdf', fileType: 'pdf', fileSize: 896000, category: 'pleading', description: 'بلاغ رسمي مقدم للنيابة العامة في قضية الاحتيال', folder: '/مرافعات', tags: JSON.stringify(['بلاغ', 'نيابة', 'احتيال']), caseIdx: 7 },
      { fileName: 'عقد_الإيجار_التجاري.pdf', fileType: 'pdf', fileSize: 640000, category: 'contract', description: 'عقد إيجار المحل التجاري محل النزاع', folder: '/', tags: JSON.stringify(['إيجار', 'تجاري']), caseIdx: 9 },
      { fileName: 'الشيكات_المرتجعة.pdf', fileType: 'pdf', fileSize: 1152000, category: 'evidence', description: 'صور الشيكات المرتجعة من البنك', folder: '/أدلة', tags: JSON.stringify(['شيكات', 'مرتجعة', 'بنك']), caseIdx: 10 },
      { fileName: 'مذكرة_الدفاع_الأولية.docx', fileType: 'doc', fileSize: 256000, category: 'pleading', description: 'مذكرة الدفاع المقدمة في قضية الشيكات', folder: '/مرافعات', tags: JSON.stringify(['مذكرة', 'دفاع']), caseIdx: 10 },
      { fileName: 'تقرير_الخبير_العقاري.pdf', fileType: 'pdf', fileSize: 4096000, category: 'evidence', description: 'تقرير التقييم العقاري للأرض المتنازع عليها', folder: '/أدلة', tags: JSON.stringify(['تقييم', 'عقاري', 'خبير']), caseIdx: 0 },
      { fileName: 'محضر_الجلسة_2024-12.pdf', fileType: 'pdf', fileSize: 384000, category: 'court_order', description: 'محضر جلسة المحكمة بتاريخ 2024/12/15', folder: '/مرافعات', tags: JSON.stringify(['محضر', 'جلسة']), caseIdx: 1 },
      { fileName: 'طلب_النفقة_المؤقتة.pdf', fileType: 'pdf', fileSize: 320000, category: 'pleading', description: 'طلب تقديم نفقة مؤقتة للأطفال', folder: '/مرافعات', tags: JSON.stringify(['نفقة', 'طلب']), caseIdx: 4, isConfidential: true },
      { fileName: 'كشوف_التحويلات_البنكية.pdf', fileType: 'pdf', fileSize: 1792000, category: 'evidence', description: 'كشوف الحسابات البنكية showing suspicious transfers', folder: '/أدلة', tags: JSON.stringify(['تحويلات', 'بنك', 'احتيال']), caseIdx: 7, isConfidential: true },
    ];

    for (const dd of docData) {
      await db.caseDocument.create({
        data: {
          fileName: dd.fileName,
          fileType: dd.fileType,
          fileSize: dd.fileSize,
          folder: dd.folder,
          tags: dd.tags,
          category: dd.category,
          description: dd.description,
          isConfidential: dd.isConfidential || false,
          isVisibleToClient: !dd.isConfidential,
          uploadedAt: new Date('2024-01-20'),
          caseId: caseIds[dd.caseIdx],
        },
      });
      docCount++;
    }
    console.log(`✅ ${docCount} documents created`);
  } catch (e) { console.error('❌ Documents error:', e); }

  // ─── 8. Billing (10) ────────────────────────────────────────────
  console.log('\n💰 Seeding billing...');
  let billingCount = 0;
  try {
    const billingData = [
      { description: 'أتعاب دراسة ملف القضية العقارية وتحضير اللائحة الأولية', hours: 12, rate: 1500, amount: 18000, status: 'paid', invoiceDate: '2024-02-01', dueDate: '2024-03-01', paidDate: '2024-02-25', caseIdx: 0 },
      { description: 'أتعاب تمثيل أمام النيابة العامة - جلسة التحقيق', hours: 6, rate: 2000, amount: 12000, status: 'sent', invoiceDate: '2024-12-20', dueDate: '2025-01-20', caseIdx: 1 },
      { description: 'أتعاب تدقيق عقد التوريد وإعداد مذكرة الدعوى', hours: 18, rate: 1500, amount: 27000, status: 'paid', invoiceDate: '2024-04-01', dueDate: '2024-05-01', paidDate: '2024-04-20', caseIdx: 2 },
      { description: 'أتعاب إعداد دعوى الفصل التعسفي وجمع المستندات', hours: 10, rate: 1200, amount: 12000, status: 'sent', invoiceDate: '2024-11-01', dueDate: '2024-12-01', caseIdx: 3 },
      { description: 'مصاريف محكمة ورسوم قضائية - قضية الحضانة', amount: 3500, status: 'paid', invoiceDate: '2024-04-01', dueDate: '2024-04-15', paidDate: '2024-04-10', caseIdx: 4 },
      { description: 'أتعاب إدارة ملف الوساطة وجلسات التفاوض', hours: 15, rate: 1800, amount: 27000, status: 'draft', caseIdx: 6 },
      { description: 'أتعاب تقديم البلاغ وجمع الأدلة الرقمية', hours: 20, rate: 2000, amount: 40000, status: 'sent', invoiceDate: '2024-08-10', dueDate: '2024-09-10', caseIdx: 7 },
      { description: 'أتعاب المرافعة في قضية الشيكات المرتجعة', hours: 8, rate: 2000, amount: 16000, status: 'overdue', invoiceDate: '2024-09-01', dueDate: '2024-10-01', caseIdx: 10 },
      { description: 'أتعاب تحضير مذكرة الدفاع - قضية التحصيل', hours: 14, rate: 1200, amount: 16800, status: 'paid', invoiceDate: '2023-07-01', dueDate: '2023-08-01', paidDate: '2023-07-25', caseIdx: 5 },
      { description: 'رسوم طلب تعيين خبير عقاري ومصاريف محكمة', amount: 5000, status: 'draft', caseIdx: 9 },
    ];

    for (const bd of billingData) {
      await db.billing.create({
        data: {
          description: bd.description,
          hours: bd.hours,
          rate: bd.rate,
          amount: bd.amount,
          currency: 'SAR',
          status: bd.status,
          invoiceDate: bd.invoiceDate ? new Date(bd.invoiceDate) : undefined,
          dueDate: bd.dueDate ? new Date(bd.dueDate) : undefined,
          paidDate: bd.paidDate ? new Date(bd.paidDate) : undefined,
          caseId: caseIds[bd.caseIdx],
        },
      });
      billingCount++;
    }
    console.log(`✅ ${billingCount} billing entries created`);
  } catch (e) { console.error('❌ Billing error:', e); }

  // ─── 9. Timeline Events (20) ────────────────────────────────────
  console.log('\n📅 Seeding timeline events...');
  let timelineCount = 0;
  try {
    const tlData = [
      { title: 'تقديم الدعوى', description: 'تم تقديم صحيفة الدعوى إلى المحكمة العامة بالرياض', eventType: 'filing', eventDate: '2024-01-15', caseIdx: 0 },
      { title: 'أول جلسة محاكمة', description: 'عُقدت الجلسة الأولى وتم تأجيل القضية لجلب المستندات', eventType: 'hearing', eventDate: '2024-02-20', caseIdx: 0 },
      { title: 'تقديم بلاغ للنيابة', description: 'تم تقديم بلاغ رسمي للنيابة العامة في قضية التزوير', eventType: 'filing', eventDate: '2024-02-25', caseIdx: 1 },
      { title: 'تحويل القضية للتحقيق', description: 'تم تحويل القضية من النيابة العامة لبدء التحقيق', eventType: 'status_change', eventDate: '2024-04-01', caseIdx: 1 },
      { title: 'تقديم دعوى تجارية', description: 'تم رفع دعوى تعويض عن الإخلال بعقد التوريد', eventType: 'filing', eventDate: '2024-03-10', caseIdx: 2 },
      { title: 'موعد نهائي لتقديم الأدلة', description: 'آخر موعد لتقديم المستندات والادلة المؤيدة للدعوى', eventType: 'deadline', eventDate: '2025-02-01', caseIdx: 2 },
      { title: 'صدور حكم المحكمة', description: 'حكمت المحكمة لصالح الموكل بمبلغ 750,000 ريال', eventType: 'status_change', eventDate: '2024-08-15', caseIdx: 5 },
      { title: 'بدء جلسات الوساطة', description: 'عُقدت أول جلسة وساطة بين شركاء الشركة المتنازعين', eventType: 'hearing', eventDate: '2024-08-15', caseIdx: 6 },
      { title: 'إيداع مبلغ التأمين', description: 'تم إيداع مبلغ التأمين القضائي في حساب المحكمة', eventType: 'payment', eventDate: '2024-03-20', caseIdx: 4 },
      { title: 'صدور أمر المحكمة بالحضانة المؤقتة', description: 'أصدرت المحكمة أولاً بحضانة الأم مع نفقة شهرية', eventType: 'document', eventDate: '2024-06-15', caseIdx: 4 },
      { title: 'رفع دعوى عمالية', description: 'تم تقديم الدعوى لمحكمة العمل بالدمام', eventType: 'filing', eventDate: '2024-04-05', caseIdx: 3 },
      { title: 'تقديم الأدلة الرقمية', description: 'تم تقديم الأدلة الإلكترونية المجمعة للنيابة العامة', eventType: 'document', eventDate: '2024-09-01', caseIdx: 7 },
      { title: 'جلسة المرافعة', description: 'جلسة مرافعة في قضية الشيكات المرتجعة - تقديم الدفاع', eventType: 'hearing', eventDate: '2024-10-15', caseIdx: 10 },
      { title: 'تسوية ودية', description: 'تم التوصل إلى تسوية ودية بين الطرفين بقيمة متفق عليها', eventType: 'status_change', eventDate: '2024-03-15', caseIdx: 8 },
      { title: 'تقديم تقرير الخبير العقاري', description: 'تم تقديم تقرير تقييم الأرض من مكتب الخبراء المعتمد', eventType: 'document', eventDate: '2024-12-01', caseIdx: 0 },
      { title: 'إشعار الجلسة القادمة', description: 'تم تلقي إشعار بموعد الجلسة القادمة في قضية الإيجار', eventType: 'hearing', eventDate: '2025-01-15', caseIdx: 9 },
      { title: 'تحصيل مبلغ الحكم', description: 'تم تحصيل مبلغ الحكم كاملاً من المحكوم عليه', eventType: 'payment', eventDate: '2024-09-01', caseIdx: 5 },
      { title: 'تقديم مذكرة دفع بعدم الاختصاص', description: 'تم تقديم مذكرة دفع بعدم اختصاص المحكمة بنظر النزاع', eventType: 'filing', eventDate: '2024-07-10', caseIdx: 10 },
      { title: 'موعد نهائي للرد', description: 'آخر موعد لتقديم الرد على مذكرة المدعي', eventType: 'deadline', eventDate: '2025-01-25', caseIdx: 1 },
      { title: 'تقرير الصلح المالي', description: 'تم إنهاء القضية بالصلح وتم صرف مستحقات الموظف', eventType: 'payment', eventDate: '2024-03-20', caseIdx: 8 },
    ];

    for (const td of tlData) {
      await db.timelineEvent.create({
        data: {
          title: td.title,
          description: td.description,
          eventType: td.eventType,
          eventDate: new Date(td.eventDate),
          caseId: caseIds[td.caseIdx],
        },
      });
      timelineCount++;
    }
    console.log(`✅ ${timelineCount} timeline events created`);
  } catch (e) { console.error('❌ Timeline error:', e); }

  // ─── 10. Activity Log (15) ──────────────────────────────────────
  console.log('\n📝 Seeding activities...');
  let activityCount = 0;
  try {
    const actData = [
      { action: 'case_created', description: 'تم إنشاء قضية نزاع عقاري جديدة', entity: 'case', entityId: caseIds[0], caseIdx: 0 },
      { action: 'document_uploaded', description: 'تم رفع عقد بيع الأرض', entity: 'document', entityId: caseIds[0], caseIdx: 0 },
      { action: 'task_completed', description: 'تم إكمال مراجعة تقرير الخبير الجنائي', entity: 'task', entityId: caseIds[1], caseIdx: 1 },
      { action: 'case_status_changed', description: 'تم تغيير حالة قضية التحصيل إلى "مغلق"', entity: 'case', entityId: caseIds[5], caseIdx: 5 },
      { action: 'invoice_sent', description: 'تم إرسال فاتورة أتعاب المرافعة', entity: 'billing', entityId: caseIds[1], caseIdx: 1 },
      { action: 'task_created', description: 'تم إضافة مهمة تحضير مذكرة الدفاع', entity: 'task', entityId: caseIds[0], caseIdx: 0 },
      { action: 'hearing_scheduled', description: 'تم تحديد موعد جلسة جديدة في قضية التوريد', entity: 'case', entityId: caseIds[2], caseIdx: 2 },
      { action: 'client_added', description: 'تم إضافة عميل جديد: شركة النور للتجارة', entity: 'client', entityId: caseIds[0], caseIdx: 0 },
      { action: 'document_uploaded', description: 'تم رفع تقرير الخبير العقاري', entity: 'document', entityId: caseIds[0], caseIdx: 0 },
      { action: 'settlement_reached', description: 'تم التوصل إلى تسوية في قضية الشراكة التجارية', entity: 'case', entityId: caseIds[6], caseIdx: 6 },
      { action: 'case_created', description: 'تم إنشاء قضية احتيال إلكتروني جديدة', entity: 'case', entityId: caseIds[7], caseIdx: 7 },
      { action: 'task_completed', description: 'تم إكمال تقديم البلاغ للنيابة العامة', entity: 'task', entityId: caseIds[7], caseIdx: 7 },
      { action: 'invoice_paid', description: 'تم استلام دفعة فاتورة قضية التحصيل', entity: 'billing', entityId: caseIds[5], caseIdx: 5 },
      { action: 'case_status_changed', description: 'تم تحويل قضية الشيكات إلى مرحلة المحاكمة', entity: 'case', entityId: caseIds[10], caseIdx: 10 },
      { action: 'task_created', description: 'تم إضافة مهمة طلب تعيين خبير خطوط', entity: 'task', entityId: caseIds[1], caseIdx: 1 },
    ];

    for (const ad of actData) {
      await db.activity.create({
        data: {
          action: ad.action,
          description: ad.description,
          entity: ad.entity,
          entityId: ad.entityId,
          lawyerId: lawyerId,
          caseId: caseIds[ad.caseIdx],
        },
      });
      activityCount++;
    }
    console.log(`✅ ${activityCount} activity log entries created`);
  } catch (e) { console.error('❌ Activity error:', e); }

  // ─── 11. Case Parties (30+) ─────────────────────────────────────
  console.log('\n⚖️  Seeding case parties...');
  let partyCount = 0;
  try {
    const partyData = [
      // Case 0 - نزاع عقاري
      { name: 'محمد بن خالد الراشدي', role: 'plaintiff', type: 'individual', caseIdx: 0, notes: 'المدعي - مالك الأرض' },
      { name: 'عبدالرحمن بن سالم الحربي', role: 'defendant', type: 'individual', caseIdx: 0, lawyer: 'المحامي ماجد السبيعي', notes: 'المدعى عليه - يدعي الملكية' },
      { name: 'سعد بن فهد المطيري', role: 'witness', type: 'individual', caseIdx: 0, notes: 'شاهد على معاملة البيع القديمة' },
      { name: 'مكتب الخبراء العقاريين', role: 'expert', type: 'corporate', caseIdx: 0, notes: 'خبير عقاري معتمد' },
      { name: 'القاضي أحمد الشمري', role: 'judge', type: 'individual', caseIdx: 0 },
      { name: 'المحامي ماجد السبيعي', role: 'opposing_counsel', type: 'individual', email: 'majed@law-sa.com', caseIdx: 0 },

      // Case 1 - تزوير مستندات
      { name: 'شركة النور للتجارة', role: 'plaintiff', type: 'corporate', caseIdx: 1, notes: 'الجهة المتضررة من التزوير' },
      { name: 'فهد بن عبدالعزيز المنصور', role: 'defendant', type: 'individual', caseIdx: 1, lawyer: 'النيابة العامة', notes: 'المتهم بالتزوير' },
      { name: 'خالد بن سعد العتيبي', role: 'witness', type: 'individual', caseIdx: 1, notes: 'موظف الشركة الذي اكتشف التزوير' },
      { name: 'الإدارة العامة للمختبرات الجنائية', role: 'expert', type: 'government', caseIdx: 1, notes: 'جهة فحص التوقيعات' },
      { name: 'القاضي فيصل الدوسري', role: 'judge', type: 'individual', caseIdx: 1 },

      // Case 2 - نزاع توريد
      { name: 'شركة النور للتجارة', role: 'plaintiff', type: 'corporate', caseIdx: 2, notes: 'المورد - المطالب بالتعويض' },
      { name: 'مؤسسة البناء الحديث', role: 'defendant', type: 'corporate', caseIdx: 2, lawyer: 'المحامي عبدالرحمن الغامدي', notes: 'المقاول المتعهد بالتوريد' },
      { name: 'سلطان بن محمد الحربي', role: 'witness', type: 'individual', caseIdx: 2, notes: 'وسيط في الصفقة' },

      // Case 3 - فصل تعسفي
      { name: 'فاطمة بنت عبدالرحمن القحطاني', role: 'plaintiff', type: 'individual', caseIdx: 3, notes: 'الموظفة المفصولة' },
      { name: 'شركة التقنية المتقدمة', role: 'defendant', type: 'corporate', caseIdx: 3, lawyer: 'المحامية هدى الزيلعي', notes: 'الشركة المدعى عليها' },

      // Case 4 - حضانة
      { name: 'فاطمة بنت عبدالرحمن القحطاني', role: 'plaintiff', type: 'individual', caseIdx: 4, notes: 'الأم - المطالبة بالحضانة' },
      { name: 'خالد بن سعود المطيري', role: 'defendant', type: 'individual', caseIdx: 4, lawyer: 'المحامي تركي الحربي', notes: 'الأب - المدعى عليه' },
      { name: 'القاضي محمد العنزي', role: 'judge', type: 'individual', caseIdx: 4 },

      // Case 5 - تحصيل دين
      { name: 'شركة البناء المتقدم المحدودة', role: 'plaintiff', type: 'corporate', caseIdx: 5 },
      { name: 'شركة الديكور المنزلي', role: 'defendant', type: 'corporate', caseIdx: 5, lawyer: 'المحامي ناصر الشمري' },

      // Case 6 - شراكة
      { name: 'شركة البناء المتقدم المحدودة', role: 'plaintiff', type: 'corporate', caseIdx: 6, notes: 'أحد الشركاء' },
      { name: 'ناصر بن فهد العمري', role: 'defendant', type: 'individual', caseIdx: 6, lawyer: 'المحامي فهد العتيبي', notes: 'الشريك الآخر' },
      { name: 'المُوَسِّط ناصر السبيعي', role: 'third_party', type: 'individual', caseIdx: 6, notes: 'وسيط تجاري معتمد' },

      // Case 7 - احتيال إلكتروني
      { name: 'سلطان بن فهد العتيبي', role: 'plaintiff', type: 'individual', caseIdx: 7, notes: 'المجني عليه' },
      { name: 'شخص مجهول', role: 'defendant', type: 'individual', caseIdx: 7, notes: 'مجهول الهوية - قيد التحقيق' },

      // Case 9 - إيجار
      { name: 'سلطان بن فهد العتيبي', role: 'plaintiff', type: 'individual', caseIdx: 9, notes: 'المستأجر' },
      { name: 'شركة العقارات الذهبية', role: 'defendant', type: 'corporate', caseIdx: 9, lawyer: 'المحامي مشعل القحطاني', notes: 'المؤجر' },
      { name: 'مكتب تقييم الممتلكات', role: 'expert', type: 'corporate', caseIdx: 9 },

      // Case 10 - شيكات
      { name: 'شركة النور للتجارة', role: 'plaintiff', type: 'corporate', caseIdx: 10 },
      { name: 'سلطان بن خالد الرشيدي', role: 'defendant', type: 'individual', caseIdx: 10, notes: 'صادر الشيكات المرتجعة' },
      { name: 'القاضي فيصل الدوسري', role: 'judge', type: 'individual', caseIdx: 10 },
    ];

    for (const pd of partyData) {
      await db.caseParty.create({
        data: {
          name: pd.name,
          role: pd.role,
          type: pd.type || 'individual',
          email: pd.email,
          lawyer: pd.lawyer,
          notes: pd.notes,
          caseId: caseIds[pd.caseIdx],
        },
      });
      partyCount++;
    }
    console.log(`✅ ${partyCount} case parties created`);
  } catch (e) { console.error('❌ Case parties error:', e); }

  // ─── 12. Comments (20 with replies) ─────────────────────────────
  console.log('\n💬 Seeding comments...');
  let commentCount = 0;
  try {
    // Comments on various cases
    const c1 = await db.comment.create({ data: { content: 'تم مراجعة عقد البيع ووجدنا مخالفة في البند الرابع المتعلق بتحديد حدود الأرض. نحتاج لمراجعة مساح بلدية الرياض.', isInternal: true, caseId: caseIds[0], lawyerId: lawyerId } });
    const c1r = await db.comment.create({ data: { content: 'تم حجز موعد مع مكتب المساحة يوم الأحد القادم', isInternal: true, caseId: caseIds[0], memberId: teamIds[0], parentId: c1.id } });
    commentCount += 2;

    const c2 = await db.comment.create({ data: { content: 'عميلنا يرغب في الاطلاع على آخر مستجدات القضية. يرجى تحديث حالة الملف.', isInternal: false, caseId: caseIds[0], lawyerId: lawyerId } });
    commentCount++;

    const c3 = await db.comment.create({ data: { content: 'تقرير المختبرات الجنائية يؤكد تزوير 3 توقيعات من أصل 5. هذا يقوي موقفنا بشكل كبير.', isInternal: true, caseId: caseIds[1], lawyerId: lawyerId } });
    const c3r = await db.comment.create({ data: { content: 'ممتاز! سأقوم بإعداد مذكرة تلخيص النتائج لتقديمها للنيابة', isInternal: true, caseId: caseIds[1], memberId: teamIds[2], parentId: c3.id } });
    commentCount += 2;

    const c4 = await db.comment.create({ data: { content: 'الخصم طلب تأجيل الجلسة. نحتاج الرد على طلب التأجيل خلال 3 أيام.', isInternal: true, caseId: caseIds[2], lawyerId: lawyerId } });
    commentCount++;

    const c5 = await db.comment.create({ data: { content: 'الموظفة فاطمة قدمت كشوف مرتبات إضافية تثبت استحقاقها لبدلات لم تصرف', isInternal: true, caseId: caseIds[3], memberId: teamIds[1] } });
    const c5r = await db.comment.create({ data: { content: 'جيد جداً. أضيفيها لملف القضية وحددي قيمتها الإجمالية', isInternal: true, caseId: caseIds[3], lawyerId: lawyerId, parentId: c5.id } });
    commentCount += 2;

    const c6 = await db.comment.create({ data: { content: 'أخطرنا المحكمة بأن الموكلة بحاجة إلى حماية مؤقتة للأطفال حتى البت في القضية', isInternal: false, caseId: caseIds[4], lawyerId: lawyerId } });
    commentCount++;

    const c7 = await db.comment.create({ data: { content: 'تم استلام دفعة من الموكل بقيمة 27000 ريال كأتعاب جزئية لملف الوساطة', isInternal: true, caseId: caseIds[6], memberId: teamIds[3] } });
    commentCount++;

    const c8 = await db.comment.create({ data: { content: 'فريق الأمن السيبراني أكد وجود تحويلات مشبوهة بذكاء اصطناعي. الأدلة قوية.', isInternal: true, caseId: caseIds[7], lawyerId: lawyerId } });
    const c8r = await db.comment.create({ data: { content: 'هل تم توثيقها بشكل قانوني صحيح؟ نحتاج سلسلة حيازة واضحة للأدلة الرقمية', isInternal: true, caseId: caseIds[7], memberId: teamIds[2], parentId: c8.id } });
    const c8r2 = await db.comment.create({ data: { content: 'نعم، تم التوثيق وفق المعايير الدولية ISO 27037', isInternal: true, caseId: caseIds[7], lawyerId: lawyerId, parentId: c8r.id } });
    commentCount += 3;

    const c9 = await db.comment.create({ data: { content: 'تم الفصل في القضية لصالح موكلنا. الحكم نهائي وقطعي.', isInternal: false, caseId: caseIds[5], lawyerId: lawyerId } });
    commentCount++;

    const c10 = await db.comment.create({ data: { content: 'المؤجر قدم إثباتات على الصيانة الدورية للمبنى. حجتنا تحتاج تعزيز.', isInternal: true, caseId: caseIds[9], lawyerId: lawyerId } });
    commentCount++;

    const c11 = await db.comment.create({ data: { content: 'الموكل يستعجل صدور الحكم. سنقوم بتقديم طلب لتسريع الإجراءات.', isInternal: true, caseId: caseIds[10], memberId: teamIds[0] } });
    const c11r = await db.comment.create({ data: { content: 'تم إعداد الطلب وسيقدم في الجلسة القادمة', isInternal: true, caseId: caseIds[10], lawyerId: lawyerId, parentId: c11.id } });
    commentCount += 2;

    const c12 = await db.comment.create({ data: { content: 'قضية مغلقة بنجاح. تم تحصيل المبلغ بالكامل.', isInternal: true, caseId: caseIds[8], lawyerId: lawyerId } });
    commentCount++;

    console.log(`✅ ${commentCount} comments created`);
  } catch (e) { console.error('❌ Comments error:', e); }

  // ─── 13. Time Entries (40) ──────────────────────────────────────
  console.log('\n⏱️  Seeding time entries...');
  let timeCount = 0;
  try {
    const timeData = [
      // Case 0 - Real estate
      { description: 'مراجعة عقد بيع الأرض وصك الملكية', duration: 60, rate: 1500, isBillable: true, activityType: 'review', date: '2024-01-20', caseIdx: 0 },
      { description: 'بحث عن سابقة قضائية مشابهة', duration: 90, rate: 1500, isBillable: true, activityType: 'research', date: '2024-01-22', caseIdx: 0 },
      { description: 'صياغة مذكرة الدفاع الأولية', duration: 120, rate: 1500, isBillable: true, activityType: 'drafting', date: '2024-01-25', caseIdx: 0 },
      { description: 'اجتماع مع الموكل لمناقشة القضية', duration: 45, rate: 1500, isBillable: true, activityType: 'meeting', date: '2024-01-28', caseIdx: 0 },
      // Case 1 - Forgery
      { description: 'مراجعة تقرير المختبرات الجنائية', duration: 75, rate: 2000, isBillable: true, activityType: 'review', date: '2024-12-10', caseIdx: 1 },
      { description: 'تحضير أسئلة للتحقيق', duration: 60, rate: 2000, isBillable: true, activityType: 'drafting', date: '2024-12-14', caseIdx: 1 },
      { description: 'حضور جلسة التحقيق في النيابة', duration: 90, rate: 2000, isBillable: true, activityType: 'court', date: '2024-12-18', caseIdx: 1 },
      { description: 'مكالمة مع المحقق الجنائي', duration: 20, rate: 1200, isBillable: true, activityType: 'phone', date: '2024-12-20', caseIdx: 1 },
      // Case 2 - Commercial
      { description: 'تدقيق عقد التوريد بالكامل', duration: 105, rate: 1500, isBillable: true, activityType: 'review', date: '2024-03-15', caseIdx: 2 },
      { description: 'بحث في قانون التجارة السعودي', duration: 60, rate: 1500, isBillable: true, activityType: 'research', date: '2024-03-18', caseIdx: 2 },
      { description: 'صياغة صحيفة الدعوى التجارية', duration: 90, rate: 1500, isBillable: true, activityType: 'drafting', date: '2024-03-20', caseIdx: 2 },
      { description: 'اجتماع مع المحاسب لحساب التعويضات', duration: 45, rate: 1000, isBillable: false, activityType: 'meeting', date: '2024-03-25', caseIdx: 2 },
      // Case 3 - Labor
      { description: 'مقابلة الموظفة فاطمة وأخذ إفادتها', duration: 60, rate: 1200, isBillable: true, activityType: 'meeting', date: '2024-04-10', caseIdx: 3 },
      { description: 'جمع كشوف المرتبات والوثائق', duration: 30, rate: 1000, isBillable: false, activityType: 'filing', date: '2024-04-15', caseIdx: 3 },
      { description: 'صياغة لائحة الدعوى العمالية', duration: 75, rate: 1200, isBillable: true, activityType: 'drafting', date: '2024-04-20', caseIdx: 3 },
      { description: 'إرسال بريد إلكتروني لصندوق تنمية الموارد البشرية', duration: 15, rate: 800, isBillable: false, activityType: 'email', date: '2024-11-05', caseIdx: 3 },
      // Case 4 - Family
      { description: 'مراجعة عقد الزواج ووثيقة الطلاق', duration: 45, rate: 1200, isBillable: true, activityType: 'review', date: '2024-03-28', caseIdx: 4 },
      { description: 'إعداد قائمة احتياجات الأطفال', duration: 60, rate: 1200, isBillable: true, activityType: 'drafting', date: '2024-04-01', caseIdx: 4 },
      { description: 'حضور جلسة المحكمة - الأحوال الشخصية', duration: 120, rate: 1500, isBillable: true, activityType: 'court', date: '2024-06-15', caseIdx: 4 },
      { description: 'مكالمة مع الموكلة للاطمئنان', duration: 20, rate: 800, isBillable: true, activityType: 'phone', date: '2024-07-01', caseIdx: 4 },
      // Case 6 - Partnership
      { description: 'مراجعة عقد التأسيس واللوائح', duration: 90, rate: 1800, isBillable: true, activityType: 'review', date: '2024-05-25', caseIdx: 6 },
      { description: 'حساب حصص الأرباح والخسائر', duration: 120, rate: 1800, isBillable: true, activityType: 'research', date: '2024-06-01', caseIdx: 6 },
      { description: 'صياغة ملف الوساطة', duration: 60, rate: 1800, isBillable: true, activityType: 'drafting', date: '2024-08-10', caseIdx: 6 },
      { description: 'حضور جلسة الوساطة', duration: 180, rate: 2000, isBillable: true, activityType: 'meeting', date: '2024-08-15', caseIdx: 6 },
      // Case 7 - Cyber fraud
      { description: 'إعداد وتقديم بلاغ للنيابة', duration: 120, rate: 2000, isBillable: true, activityType: 'filing', date: '2024-07-28', caseIdx: 7 },
      { description: 'اجتماع مع فريق الأمن السيبراني', duration: 60, rate: 1500, isBillable: true, activityType: 'meeting', date: '2024-08-15', caseIdx: 7 },
      { description: 'بحث في قانون الجرائم المعلوماتية', duration: 45, rate: 1500, isBillable: true, activityType: 'research', date: '2024-09-01', caseIdx: 7 },
      { description: 'مراجعة الأدلة الرقمية المجمعة', duration: 90, rate: 2000, isBillable: true, activityType: 'review', date: '2024-09-10', caseIdx: 7 },
      // Case 9 - Lease
      { description: 'تحليل عقد الإيجار التجاري', duration: 60, rate: 1200, isBillable: true, activityType: 'review', date: '2024-06-20', caseIdx: 9 },
      { description: 'بحث عن سوابق إيجارية مشابهة', duration: 30, rate: 1000, isBillable: true, activityType: 'research', date: '2024-06-25', caseIdx: 9 },
      { description: 'صياغة مذكرة الدفاع عن المستأجر', duration: 75, rate: 1200, isBillable: true, activityType: 'drafting', date: '2024-11-10', caseIdx: 9 },
      // Case 10 - Bounced checks
      { description: 'مراجعة الشيكات المرتجعة وتحضير الدفاع', duration: 90, rate: 2000, isBillable: true, activityType: 'review', date: '2024-07-10', caseIdx: 10 },
      { description: 'حضور جلسة المحاكمة - شيكات', duration: 120, rate: 2000, isBillable: true, activityType: 'court', date: '2024-10-15', caseIdx: 10 },
      { description: 'صياغة مذكرة الرد على الادعاء', duration: 75, rate: 2000, isBillable: true, activityType: 'drafting', date: '2024-12-01', caseIdx: 10 },
      { description: 'مكالمة مع محامي الخصم للتفاوض', duration: 30, rate: 1500, isBillable: true, activityType: 'phone', date: '2024-12-15', caseIdx: 10 },
      { description: 'إرسال بريد للبنك لطلب كشوف إضافية', duration: 15, rate: 800, isBillable: false, activityType: 'email', date: '2024-12-20', caseIdx: 10 },
      { description: 'بحث في أحكام نقض الشيكات', duration: 45, rate: 1500, isBillable: true, activityType: 'research', date: '2025-01-10', caseIdx: 10 },
      // General admin
      { description: 'مراجعة عامة لملفات القضايا المفتوحة', duration: 60, rate: 800, isBillable: false, activityType: 'other', date: '2025-01-15', caseIdx: 0 },
      { description: 'تحديث سجلات المحكمة الإلكترونية', duration: 30, rate: 800, isBillable: false, activityType: 'other', date: '2025-01-18', caseIdx: 1 },
    ];

    for (const td of timeData) {
      await db.timeEntry.create({
        data: {
          description: td.description,
          duration: td.duration,
          rate: td.rate,
          isBillable: td.isBillable,
          activityType: td.activityType,
          date: new Date(td.date),
          caseId: caseIds[td.caseIdx],
          lawyerId: lawyerId,
        },
      });
      timeCount++;
    }
    console.log(`✅ ${timeCount} time entries created`);
  } catch (e) { console.error('❌ Time entries error:', e); }

  // ─── 14. Expenses (15) ──────────────────────────────────────────
  console.log('\n💸 Seeding expenses...');
  let expenseCount = 0;
  try {
    const expData = [
      { description: 'تذاكر سفر إلى الدمام - جلسة محكمة العمل', amount: 850, category: 'travel', date: '2024-04-04', caseIdx: 3 },
      { description: 'رسوم تقديم الدعوى التجارية', amount: 2500, category: 'filing', date: '2024-03-10', caseIdx: 2 },
      { description: 'رسوم تقرير الخبير العقاري', amount: 5000, category: 'expert', date: '2024-02-01', caseIdx: 0 },
      { description: 'بريد سريع - إرسال مستندات للنيابة', amount: 120, category: 'courier', date: '2024-02-25', caseIdx: 1 },
      { description: 'طباعة وتصوير مستندات القضية', amount: 350, category: 'printing', date: '2024-03-01', caseIdx: 0 },
      { description: 'تذاكر سفر إلى جدة - اجتماع مع عميل', amount: 1200, category: 'travel', date: '2024-05-15', caseIdx: 2 },
      { description: 'رسوم تقديم طلب النفقة المؤقتة', amount: 500, category: 'filing', date: '2024-05-28', caseIdx: 4 },
      { description: 'رسوم خبير خطوط يدوية', amount: 3500, category: 'expert', date: '2024-12-01', caseIdx: 1 },
      { description: 'بريد سريع - إرسال مذكرة دفاع', amount: 180, category: 'courier', date: '2024-12-20', caseIdx: 10 },
      { description: 'طباعة ملف الوساطة الكامل', amount: 600, category: 'printing', date: '2024-08-12', caseIdx: 6 },
      { description: 'تذاكر سفر إلى الرياض - جلسة شيكات', amount: 350, category: 'travel', date: '2024-10-14', caseIdx: 10 },
      { description: 'رسوم فحص رقمي للأدلة الإلكترونية', amount: 7000, category: 'expert', date: '2024-08-20', caseIdx: 7 },
      { description: 'رسوم تقديم بلاغ النيابة العامة', amount: 200, category: 'filing', date: '2024-07-28', caseIdx: 7 },
      { description: 'بريد سريع - وثائق الشراكة', amount: 150, category: 'courier', date: '2024-08-05', caseIdx: 6 },
      { description: 'مصاريف طباعة ملفات القضايا الشهرية', amount: 450, category: 'printing', date: '2025-01-10', caseIdx: 0 },
    ];

    for (const ed of expData) {
      await db.expense.create({
        data: {
          description: ed.description,
          amount: ed.amount,
          currency: 'SAR',
          category: ed.category,
          isBillable: true,
          date: new Date(ed.date),
          caseId: caseIds[ed.caseIdx],
        },
      });
      expenseCount++;
    }
    console.log(`✅ ${expenseCount} expenses created`);
  } catch (e) { console.error('❌ Expenses error:', e); }

  // ─── 15. Calendar Events (25) ───────────────────────────────────
  console.log('\n📆 Seeding calendar events...');
  let calendarCount = 0;
  try {
    const calData = [
      { title: 'جلسة المحكمة - نزاع عقاري', description: 'الجلسة الثانية في قضية الأرض', eventType: 'hearing', startDate: '2025-02-10T09:00:00', endDate: '2025-02-10T11:00:00', location: 'المحكمة العامة بالرياض - الدائرة الثالثة', reminder: '1d', color: '#ef4444', caseIdx: 0 },
      { title: 'جلسة تحقيق النيابة - تزوير', description: 'جلسة استماع لشهود التزوير', eventType: 'hearing', startDate: '2025-01-28T10:00:00', endDate: '2025-01-28T12:00:00', location: 'النيابة العامة بالرياض', reminder: '1d', color: '#ef4444', caseIdx: 1 },
      { title: 'موعد نهائي - تقديم الأدلة', description: 'آخر موعد لتقديم المستندات المؤيدة', eventType: 'deadline', startDate: '2025-02-01', reminder: '1d', color: '#f59e0b', caseIdx: 2 },
      { title: 'جلسة محكمة العمل', description: 'مرافعة في دعوى الفصل التعسفي', eventType: 'hearing', startDate: '2025-02-20T09:30:00', endDate: '2025-02-20T11:30:00', location: 'محكمة العمل بالدمام', reminder: '1d', color: '#ef4444', caseIdx: 3 },
      { title: 'جلسة الأحوال الشخصية', description: 'جلسة نظر في قضية الحضانة', eventType: 'hearing', startDate: '2025-02-05T10:00:00', endDate: '2025-02-05T12:00:00', location: 'محكمة الأحوال الشخصية بالرياض', reminder: '1d', color: '#ef4444', caseIdx: 4 },
      { title: 'جلسة وساطة - شراكة تجارية', description: 'الجلسة الثالثة من جلسات الوساطة', eventType: 'mediation', startDate: '2025-02-12T14:00:00', endDate: '2025-02-12T17:00:00', location: 'مركز الوساطة التجاري بالرياض', reminder: '30min', color: '#8b5cf6', caseIdx: 6 },
      { title: 'موعد تقديم بلاغ', description: 'متابعة بلاغ الاحتيال الإلكتروني', eventType: 'filing', startDate: '2025-02-05', location: 'النيابة العامة - الفرع الإلكتروني', reminder: '1h', color: '#3b82f6', caseIdx: 7 },
      { title: 'جلسة الإيجار التجاري', description: 'مرافعة في نزاع عقد الإيجار', eventType: 'hearing', startDate: '2025-03-01T09:00:00', endDate: '2025-03-01T11:00:00', location: 'محكمة التنفيذ بالرياض', reminder: '1d', color: '#ef4444', caseIdx: 9 },
      { title: 'جلسة المحاكمة - شيكات', description: 'جلسة المرافعة في قضية الشيكات المرتجعة', eventType: 'trial', startDate: '2025-01-30T09:00:00', endDate: '2025-01-30T12:00:00', location: 'المحكمة الجزائية بالرياض', reminder: '1d', color: '#ef4444', caseIdx: 10 },
      { title: 'اجتماع مع الموكل - شركة النور', description: 'مناقشة مستجدات القضايا', eventType: 'meeting', startDate: '2025-01-26T14:00:00', endDate: '2025-01-26T15:30:00', location: 'مكتب المكتب - الرياض', reminder: '1h', color: '#22c55e', caseIdx: 2 },
      { title: 'إفادة الشاهد - قضية الأرض', description: 'تدوين إفادة الشاهد سعد المطيري', eventType: 'deposition', startDate: '2025-02-01T10:00:00', endDate: '2025-02-01T12:00:00', location: 'مكتب المكتب', reminder: '1d', color: '#f59e0b', caseIdx: 0 },
      { title: 'موعد تقديم مذكرة الرد', description: 'آخر موعد للرد على ادعاءات المدعي العام', eventType: 'deadline', startDate: '2025-01-25', reminder: '1d', color: '#f59e0b', caseIdx: 1 },
      { title: 'اجتماع فريق العمل - قضية الاحتيال', description: 'مراجعة الأدلة الرقمية مع الفريق', eventType: 'meeting', startDate: '2025-02-08T11:00:00', endDate: '2025-02-08T12:30:00', location: 'مكتب المكتب', reminder: '1h', color: '#22c55e', caseIdx: 7 },
      { title: 'تقديم مستندات للمحكمة', description: 'إيداع المستندات الجديدة في ملف القضية', eventType: 'filing', startDate: '2025-02-15', location: 'المحكمة التجارية بالرياض', reminder: '30min', color: '#3b82f6', caseIdx: 2 },
      { title: 'جلسة محاكمة - شيكات (ثانية)', description: 'استمرار المحاكمة وسماع الشهود', eventType: 'trial', startDate: '2025-03-15T09:00:00', endDate: '2025-03-15T13:00:00', location: 'المحكمة الجزائية بالرياض', reminder: '1d', color: '#ef4444', caseIdx: 10 },
      { title: 'وساطة - نزاع الشراكة (رابعة)', description: 'محاولة الوصول لتسوية نهائية', eventType: 'mediation', startDate: '2025-03-01T10:00:00', endDate: '2025-03-01T13:00:00', location: 'مركز الوساطة التجاري', reminder: '1d', color: '#8b5cf6', caseIdx: 6 },
      { title: 'اجتماع مع الموكلة فاطمة', description: 'مناقشة تفاصيل الحضانة', eventType: 'meeting', startDate: '2025-02-03T16:00:00', endDate: '2025-02-03T17:00:00', location: 'مكتب المكتب', reminder: '1h', color: '#22c55e', caseIdx: 4 },
      { title: 'موعد نهائي - رد على دفع بعدم الاختصاص', description: 'آخر موعد لتقديم الرد', eventType: 'deadline', startDate: '2025-02-20', reminder: '1d', color: '#f59e0b', caseIdx: 10 },
      { title: 'جلسة استماع - إفادة موظف سابق', description: 'إفادة في قضية الفصل التعسفي', eventType: 'deposition', startDate: '2025-02-25T10:00:00', endDate: '2025-02-25T11:30:00', location: 'مكتب المكتب - الدمام', reminder: '1d', color: '#f59e0b', caseIdx: 3 },
      { title: 'تقديم طلب تعيين خبير خطوط', description: 'تقديم الطلب للمحكمة', eventType: 'filing', startDate: '2025-02-08', location: 'المحكمة الجزائية بالرياض', reminder: '1h', color: '#3b82f6', caseIdx: 1 },
      { title: 'اجتماع مراجعة أدلة - قضية التوريد', description: 'مراجعة شاملة للأدلة المقدمة', eventType: 'meeting', startDate: '2025-01-30T11:00:00', endDate: '2025-01-30T12:00:00', location: 'مكتب المكتب', reminder: '1h', color: '#22c55e', caseIdx: 2 },
      { title: 'جلسة أولى - محاكمة الاحتيال', description: 'بدء المحاكمة في قضية الاحتيال الإلكتروني', eventType: 'trial', startDate: '2025-04-01T09:00:00', endDate: '2025-04-01T12:00:00', location: 'المحكمة الجزائية بالرياض', reminder: '1d', color: '#ef4444', caseIdx: 7 },
      { title: 'تقديم كشف حساب للنيابة', description: 'إيداع كشوف التحويلات البنكية', eventType: 'filing', startDate: '2025-02-10', location: 'النيابة العامة', reminder: '30min', color: '#3b82f6', caseIdx: 7 },
      { title: 'إفادة خبير عقاري - الإيجار', description: 'حضور إفادة الخبير في المحكمة', eventType: 'deposition', startDate: '2025-03-10T10:00:00', endDate: '2025-03-10T11:00:00', location: 'محكمة التنفيذ بالرياض', reminder: '1d', color: '#f59e0b', caseIdx: 9 },
    ];

    for (const cd of calData) {
      await db.calendarEvent.create({
        data: {
          title: cd.title,
          description: cd.description,
          eventType: cd.eventType,
          startDate: new Date(cd.startDate),
          endDate: cd.endDate ? new Date(cd.endDate) : undefined,
          allDay: !cd.endDate,
          location: cd.location,
          color: cd.color,
          reminder: cd.reminder,
          caseId: caseIds[cd.caseIdx],
        },
      });
      calendarCount++;
    }
    console.log(`✅ ${calendarCount} calendar events created`);
  } catch (e) { console.error('❌ Calendar events error:', e); }

  // ─── 16. Evidence Items (20) ────────────────────────────────────
  console.log('\n🔍 Seeding evidence items...');
  let evidenceCount = 0;
  try {
    const evData = [
      // Case 0 - Real estate
      { title: 'عقد بيع الأرض الأصلي', description: 'عقد بيع مؤرخ 1420هـ بين البائع والمشتري الأول', itemType: 'document', category: 'contract', dateReceived: '2024-01-20', isPrivileged: false, isConfidential: false, source: 'الموكل', caseIdx: 0 },
      { title: 'صك الملكية', description: 'صك صادر من المحكمة الشرعية', itemType: 'document', category: 'financial', dateReceived: '2024-01-20', isPrivileged: false, isConfidential: false, source: 'السجل العقاري', caseIdx: 0 },
      { title: 'صور جوية للأرض', description: 'صور من القمر الصناعي تظهر تطور المنطقة', itemType: 'photo', category: 'other', dateReceived: '2024-02-10', isPrivileged: false, isConfidential: false, source: 'خدمات المساحة', caseIdx: 0 },
      // Case 1 - Forgery
      { title: 'العقود المزورة', description: 'خمسة عقود عليها توقيعات مزيفة', itemType: 'document', category: 'contract', dateReceived: '2024-02-25', isPrivileged: true, privilegeType: 'attorney_client', isConfidential: true, source: 'النيابة العامة', caseIdx: 1 },
      { title: 'تقرير المختبرات الجنائية', description: 'تقرير فحص التوقيعات يثبت التزوير', itemType: 'document', category: 'expert_report', dateReceived: '2024-12-10', isPrivileged: false, isConfidential: false, source: 'الإدارة العامة للمختبرات الجنائية', caseIdx: 1 },
      { title: 'تسجيلات المراقبة', description: 'تسجيلات فيديو من كاميرات المراقبة', itemType: 'video', category: 'communication', dateReceived: '2024-08-01', isPrivileged: false, isConfidential: false, source: 'نظام المراقبة بالشركة', caseIdx: 1 },
      // Case 2 - Commercial
      { title: 'عقد التوريد', description: 'العقد الأصلي بين الطرفين', itemType: 'document', category: 'contract', dateReceived: '2024-03-15', isPrivileged: false, isConfidential: false, source: 'الموكل', caseIdx: 2 },
      { title: 'مراسلات البريد الإلكتروني', description: 'تبادل رسائل البريد بين الطرفين', itemType: 'digital', category: 'email', dateReceived: '2024-03-20', isPrivileged: false, isConfidential: false, source: 'خوادم الشركة', caseIdx: 2 },
      { title: 'كشوف الفواتير غير المدفوعة', description: 'فواتير لم يتم سدادها من قبل المقاول', itemType: 'document', category: 'financial', dateReceived: '2024-04-01', isPrivileged: false, isConfidential: false, source: 'إدارة المالية', caseIdx: 2 },
      // Case 3 - Labor
      { title: 'كشوف المرتبات', description: 'كشوف رواتب الموظفة فاطمة', itemType: 'document', category: 'financial', dateReceived: '2024-10-28', isPrivileged: true, privilegeType: 'attorney_client', isConfidential: true, source: 'الشركة السابقة', caseIdx: 3 },
      { title: 'رسالة الفصل', description: 'خطاب إنهاء الخدمة', itemType: 'document', category: 'communication', dateReceived: '2024-04-05', isPrivileged: false, isConfidential: false, source: 'الموكلة', caseIdx: 3 },
      // Case 4 - Family
      { title: 'شهادات ميلاد الأطفال', description: 'شهادات ميلاد الثلاثة أطفال', itemType: 'document', category: 'other', dateReceived: '2024-03-28', isPrivileged: true, privilegeType: 'attorney_client', isConfidential: true, source: 'الموكلة', caseIdx: 4 },
      { title: 'عقد الزواج ووثيقة الطلاق', description: 'الوثائق الأصلية', itemType: 'document', category: 'contract', dateReceived: '2024-03-28', isPrivileged: true, privilegeType: 'attorney_client', isConfidential: true, source: 'المحكمة', caseIdx: 4 },
      // Case 7 - Cyber fraud
      { title: 'سجلات التحويلات البنكية', description: 'كشوف الحسابات تظهر التحويلات المشبوهة', itemType: 'digital', category: 'financial', dateReceived: '2024-08-15', isPrivileged: false, isConfidential: true, source: 'البنك', caseIdx: 7 },
      { title: 'تقارير الأمن السيبراني', description: 'تقارير فنية عن الاختراق', itemType: 'document', category: 'expert_report', dateReceived: '2024-09-01', isPrivileged: true, privilegeType: 'work_product', isConfidential: true, source: 'فريق الأمن السيبراني', caseIdx: 7 },
      // Case 9 - Lease
      { title: 'عقد الإيجار', description: 'العقد الأصلي للإيجار التجاري', itemType: 'document', category: 'contract', dateReceived: '2024-06-20', isPrivileged: false, isConfidential: false, source: 'الموكل', caseIdx: 9 },
      { title: 'صور حالة المبنى', description: 'صور توثق حالة المبنى الحالية', itemType: 'photo', category: 'other', dateReceived: '2024-07-01', isPrivileged: false, isConfidential: false, source: 'موكل', caseIdx: 9 },
      // Case 10 - Bounced checks
      { title: 'الشيكات المرتجعة', description: '3 شيكات مرتجعة من البنك', itemType: 'document', category: 'financial', dateReceived: '2024-07-10', isPrivileged: false, isConfidential: false, source: 'البنك', caseIdx: 10 },
      { title: 'شهادة البنك برصيد الحساب', description: 'إشعار بنكي يثبت عدم وجود رصيد', itemType: 'document', category: 'financial', dateReceived: '2024-07-15', isPrivileged: false, isConfidential: false, source: 'البنك', caseIdx: 10 },
      { title: 'مذكرة محادثات واتساب', description: 'محادثات بين الطرفين قبل إصدار الشيكات', itemType: 'digital', category: 'communication', dateReceived: '2024-08-01', isPrivileged: false, isConfidential: true, source: 'الموكل', caseIdx: 10 },
    ];

    for (const ev of evData) {
      await db.evidenceItem.create({
        data: {
          title: ev.title,
          description: ev.description,
          itemType: ev.itemType,
          category: ev.category,
          dateReceived: new Date(ev.dateReceived),
          isPrivileged: ev.isPrivileged,
          privilegeType: ev.privilegeType,
          isConfidential: ev.isConfidential,
          source: ev.source,
          caseId: caseIds[ev.caseIdx],
        },
      });
      evidenceCount++;
    }
    console.log(`✅ ${evidenceCount} evidence items created`);
  } catch (e) { console.error('❌ Evidence items error:', e); }

  // ─── 17. Privilege Logs (10) ────────────────────────────────────
  console.log('\n🔒 Seeding privilege logs...');
  let privilegeCount = 0;
  try {
    const privData = [
      { documentTitle: 'العقود المزورة - ملاحظات المحامي', privilegeType: 'attorney_client', dateCreated: '2024-12-10', description: 'ملاحظات تحليلية كتبها المحامي بعد مراجعة العقود المزورة', withheldFrom: 'محامي الخصم', caseIdx: 1 },
      { documentTitle: 'استراتيجية الدفاع - تزوير', privilegeType: 'work_product', dateCreated: '2024-12-15', description: 'خطة الدفاع الاستراتيجية في قضية التزوير', withheldFrom: 'النيابة العامة', caseIdx: 1 },
      { documentTitle: 'تقرير مالي داخلي - كشوف المرتبات', privilegeType: 'attorney_client', dateCreated: '2024-11-01', description: 'تحليل مالي داخلي لكشوف المرتبات والاستحقاقات', withheldFrom: 'الشركة المدعى عليها', caseIdx: 3 },
      { documentTitle: 'ملاحظات جلسة الحضانة', privilegeType: 'attorney_client', dateCreated: '2024-06-15', description: 'ملاحظات المحامي خلال جلسة المحكمة', withheldFrom: 'محامي الأب', caseIdx: 4 },
      { documentTitle: 'تقارير فنية - الأمن السيبراني', privilegeType: 'work_product', dateCreated: '2024-09-01', description: 'تحليلات تقنية مفصلة حول الاختراق', withheldFrom: 'جهة التحقيق', caseIdx: 7 },
      { documentTitle: 'اتفاقية الدفاع المشترك', privilegeType: 'joint_defense', dateCreated: '2024-08-20', description: 'اتفاق بين المحامين للدفاع المشترك في قضية الاحتيال', withheldFrom: 'النيابة العامة', caseIdx: 7 },
      { documentTitle: 'تقييم المحامي - احتمالية الفوز', privilegeType: 'work_product', dateCreated: '2024-03-01', description: 'تقييم داخلي لاحتمالات النجاح في قضية التوريد', withheldFrom: 'الطرف الآخر', caseIdx: 2 },
      { documentTitle: 'رسائل الموكلة - قضية الأسرة', privilegeType: 'attorney_client', dateCreated: '2024-04-01', description: 'مراسلات خاصة بين الموكلة ومحاميها', withheldFrom: 'محامي الخصم', caseIdx: 4 },
      { documentTitle: 'مذكرة تسوية - الشراكة', privilegeType: 'settlement', dateCreated: '2024-10-01', description: 'شروط التسوية المقترحة في نزاع الشراكة', withheldFrom: 'الشريك الآخر', caseIdx: 6 },
      { documentTitle: 'تقرير خبير داخلي - خطوط', privilegeType: 'work_product', dateCreated: '2024-12-05', description: 'تحليل مسبق لتقرير خبير الخطوط الرسمي', withheldFrom: 'النيابة العامة', caseIdx: 1 },
    ];

    for (const pd of privData) {
      await db.privilegeLog.create({
        data: {
          documentTitle: pd.documentTitle,
          privilegeType: pd.privilegeType,
          dateCreated: new Date(pd.dateCreated),
          description: pd.description,
          withheldFrom: pd.withheldFrom,
          caseId: caseIds[pd.caseIdx],
        },
      });
      privilegeCount++;
    }
    console.log(`✅ ${privilegeCount} privilege logs created`);
  } catch (e) { console.error('❌ Privilege logs error:', e); }

  // ─── Summary ─────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════');
  console.log('  ✨ Wakeely Pro Database Seeded Successfully (v2)!');
  console.log('═══════════════════════════════════════════════');
  console.log(`  🚩 Feature Flags: 5`);
  console.log(`  👤 Lawyer:         1`);
  console.log(`  👥 Team Members:   ${teamIds.length}`);
  console.log(`  📋 Clients:        ${clientIds.length}`);
  console.log(`  📁 Cases:          ${caseIds.length}`);
  console.log(`  ✅ Tasks:          ${taskCount}`);
  console.log(`  📄 Documents:      ${docCount}`);
  console.log(`  💰 Billings:       ${billingCount}`);
  console.log(`  📅 Timeline:       ${timelineCount}`);
  console.log(`  📝 Activities:     ${activityCount}`);
  console.log(`  ⚖️  Case Parties:   ${partyCount}`);
  console.log(`  💬 Comments:       ${commentCount}`);
  console.log(`  ⏱️  Time Entries:   ${timeCount}`);
  console.log(`  💸 Expenses:       ${expenseCount}`);
  console.log(`  📆 Calendar:       ${calendarCount}`);
  console.log(`  🔍 Evidence:       ${evidenceCount}`);
  console.log(`  🔒 Privilege Logs: ${privilegeCount}`);
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