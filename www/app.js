/* ============================================================
   LUGAT SO'RA — FULL APPLICATION LOGIC
   ============================================================ */

'use strict';

/* ---- STATE ---- */
let folders = [];
let tempWords = [];
let currentEditFolder = null;
let currentStudyFolder = null;
let currentPracticeFolder = null;
let currentQuestionWord = null;
let currentShownLang = 'en';
let currentCorrectAnswer = '';
let sessionCorrect = 0;
let sessionTotal = 0;

/* ---- DOM ---- */
const $ = id => document.getElementById(id);
const views = document.querySelectorAll('.app-view');
const navBtns = document.querySelectorAll('.nav-btn');

// Header
const themeToggle   = $('theme-toggle');
const btnGoHome     = $('btn-go-home');
const headerLogo    = $('header-logo-home');

// Folders
const foldersList   = $('folders-list');
const foldersEmpty  = $('folders-empty-state');
const btnNewFolder  = $('btn-open-create-folder');

// Create
const createEng     = $('create-english');
const createUz      = $('create-uzbek');
const btnCreateAdd  = $('btn-create-add-word');
const createCount   = $('create-words-count');
const createList    = $('create-words-list');
const btnFinish     = $('btn-finish-create-folder');
const btnCancelCreate = $('btn-cancel-create-folder');

// Edit
const editTitle     = $('edit-folder-title');
const editEng       = $('edit-add-english');
const editUz        = $('edit-add-uzbek');
const btnEditAdd    = $('btn-edit-add-word');
const editSearch    = $('edit-words-search');
const editList      = $('edit-words-list');
const btnBackEdit   = $('btn-back-from-edit');

// Study
const studyTitle    = $('study-folder-title');
const studySearch   = $('study-words-search');
const studyList     = $('study-words-list');
const btnBackStudy  = $('btn-back-from-study');

// Global Search
const globalInput   = $('global-search-input');
const globalResults = $('global-search-results');

// Practice
const practiceFolderTitle = $('practice-folder-title');
const radioDir      = document.getElementsByName('practice-direction');
const langTag       = $('question-language-tag');
const btnSpeak      = $('btn-speak-word');
const wordText      = $('question-word-text');
const transDisplay  = $('practice-translation-display');
const answerInput   = $('practice-answer-input');
const feedback      = $('practice-feedback');
const btnCheck      = $('btn-check-answer');
const btnNext       = $('btn-next-question');
const correctCount  = $('session-correct-count');
const totalCount    = $('session-total-count');
const btnReset      = $('btn-reset-session');
const btnStop       = $('btn-stop-practice');

const toast         = $('global-feedback');

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadFolders();
    renderFoldersList();
    setupEvents();
    // Pre-load TTS voices
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
});

/* ============================================================
   THEME
   ============================================================ */
function loadTheme() {
    document.body.className = localStorage.getItem('theme') || 'dark-theme';
}
function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    document.body.className = isDark ? 'light-theme' : 'dark-theme';
    localStorage.setItem('theme', document.body.className);
}

/* ============================================================
   LOCAL STORAGE
   ============================================================ */
function loadFolders() {
    try {
        const raw = localStorage.getItem('lugat_folders');
        const parsed = raw ? JSON.parse(raw) : null;
        if (Array.isArray(parsed) && parsed.every(f => f && f.id && f.name && Array.isArray(f.words))) {
            folders = parsed;
        } else {
            folders = defaultFolders();
            saveFolders();
        }
    } catch {
        folders = defaultFolders();
        saveFolders();
    }
}
function saveFolders() {
    localStorage.setItem('lugat_folders', JSON.stringify(folders));
}
function defaultFolders() {
    const make = (id, en, uz) => ({ id, english: en, uzbek: uz, weight: 1, correctAttempts: 0, totalAttempts: 0 });
    const words = [
        // ── MEVA VA SABZAVOTLAR ──
        make('w001','apple','olma'), make('w002','banana','banan'), make('w003','orange','apelsin'),
        make('w004','grape','uzum'), make('w005','strawberry','qulupnay'), make('w006','watermelon','tarvuz'),
        make('w007','melon','qovun'), make('w008','peach','shaftoli'), make('w009','cherry','gilos'),
        make('w010','pear','nok'), make('w011','plum','olcha'), make('w012','lemon','limon'),
        make('w013','pomegranate','anor'), make('w014','fig','anjir'), make('w015','apricot','o\'rik'),
        make('w016','mango','mango'), make('w017','pineapple','ananas'), make('w018','coconut','kokos'),
        make('w019','tomato','pomidor'), make('w020','potato','kartoshka'), make('w021','onion','piyoz'),
        make('w022','garlic','sarimsoq'), make('w023','carrot','sabzi'), make('w024','cucumber','bodring'),
        make('w025','pepper','qalampir'), make('w026','eggplant','baqlajon'), make('w027','cabbage','karam'),
        make('w028','spinach','ismaloq'), make('w029','corn','makkajo\'xori'), make('w030','pumpkin','qovoq'),
        make('w031','radish','turp'), make('w032','beet','lavlagi'), make('w033','celery','shelderi'),
        make('w034','lettuce','salat'), make('w035','mushroom','qo\'ziqorin'),

        // ── HAYVONLAR ──
        make('w036','cat','mushuk'), make('w037','dog','it'), make('w038','horse','ot'),
        make('w039','cow','sigir'), make('w040','sheep','qo\'y'), make('w041','goat','echki'),
        make('w042','pig','cho\'chqa'), make('w043','chicken','tovuq'), make('w044','duck','o\'rdak'),
        make('w045','rabbit','quyon'), make('w046','lion','sher'), make('w047','tiger','yo\'lbars'),
        make('w048','elephant','fil'), make('w049','bear','ayiq'), make('w050','wolf','bo\'ri'),
        make('w051','fox','tulki'), make('w052','monkey','maymun'), make('w053','giraffe','jirafa'),
        make('w054','zebra','zebra'), make('w055','camel','tuya'), make('w056','snake','ilon'),
        make('w057','eagle','burgut'), make('w058','parrot','to\'ti'), make('w059','fish','baliq'),
        make('w060','dolphin','delfin'), make('w061','whale','kit'), make('w062','shark','akula'),
        make('w063','butterfly','kapalak'), make('w064','bee','ari'), make('w065','ant','chumoli'),
        make('w066','spider','o\'rgimchak'), make('w067','frog','baqa'), make('w068','turtle','toshbaqa'),
        make('w069','bird','qush'), make('w070','deer','bug\'u'),

        // ── OILA VA ODAMLAR ──
        make('w071','mother','ona'), make('w072','father','ota'), make('w073','sister','singil, opa'),
        make('w074','brother','aka, uka'), make('w075','son','o\'g\'il'), make('w076','daughter','qiz'),
        make('w077','grandmother','buvi'), make('w078','grandfather','bobo'), make('w079','uncle','tog\'a, amaki'),
        make('w080','aunt','xola, amma'), make('w081','cousin','amakivachcha, xolavachcha'),
        make('w082','husband','er'), make('w083','wife','xotin, ayol'), make('w084','baby','chaqaloq'),
        make('w085','child','bola'), make('w086','friend','do\'st'), make('w087','teacher','o\'qituvchi'),
        make('w088','doctor','shifokor'), make('w089','student','talaba'), make('w090','neighbor','qo\'shni'),

        // ── TANANING QISMLARI ──
        make('w091','head','bosh'), make('w092','eye','ko\'z'), make('w093','ear','quloq'),
        make('w094','nose','burun'), make('w095','mouth','og\'iz'), make('w096','tooth','tish'),
        make('w097','tongue','til'), make('w098','neck','bo\'yin'), make('w099','shoulder','yelka'),
        make('w100','arm','qo\'l'), make('w101','hand','qo\'l, kaft'), make('w102','finger','barmoq'),
        make('w103','chest','ko\'krak'), make('w104','back','orqa'), make('w105','leg','oyoq'),
        make('w106','foot','oyoq, tovon'), make('w107','knee','tizza'), make('w108','hair','soch'),
        make('w109','heart','yurak'), make('w110','stomach','qorin, oshqozon'),

        // ── RANGLAR ──
        make('w111','red','qizil'), make('w112','blue','ko\'k'), make('w113','green','yashil'),
        make('w114','yellow','sariq'), make('w115','black','qora'), make('w116','white','oq'),
        make('w117','orange','to\'q sariq'), make('w118','purple','binafsha'), make('w119','pink','pushti'),
        make('w120','brown','jigarrang'), make('w121','grey','kulrang'), make('w122','gold','oltin rang'),
        make('w123','silver','kumush rang'), make('w124','dark','to\'q'), make('w125','light','och'),

        // ── KUNDALIK HAYOT ──
        make('w126','house','uy'), make('w127','room','xona'), make('w128','door','eshik'),
        make('w129','window','deraza'), make('w130','table','stol'), make('w131','chair','stul'),
        make('w132','bed','karavot'), make('w133','kitchen','oshxona'), make('w134','bathroom','hammom'),
        make('w135','garden','bog\''), make('w136','street','ko\'cha'), make('w137','city','shahar'),
        make('w138','village','qishloq'), make('w139','school','maktab'), make('w140','hospital','kasalxona'),
        make('w141','market','bozor'), make('w142','shop','do\'kon'), make('w143','bank','bank'),
        make('w144','mosque','masjid'), make('w145','park','bog\', park'), make('w146','road','yo\'l'),
        make('w147','bridge','ko\'prik'), make('w148','airport','aeroport'), make('w149','station','stansiya'),
        make('w150','hotel','mehmonxona'),

        // ── TRANSPORT ──
        make('w151','car','mashina'), make('w152','bus','avtobus'), make('w153','train','poezd'),
        make('w154','plane','samolyot'), make('w155','bicycle','velosiped'), make('w156','motorcycle','mototsikl'),
        make('w157','ship','kema'), make('w158','taxi','taksi'), make('w159','truck','yuk mashinasi'),
        make('w160','helicopter','vertolyot'),

        // ── OVQAT VA ICHIMLIK ──
        make('w161','bread','non'), make('w162','rice','guruch'), make('w163','meat','go\'sht'),
        make('w164','chicken','tovuq go\'shti'), make('w165','fish','baliq'), make('w166','egg','tuxum'),
        make('w167','milk','sut'), make('w168','cheese','pishloq'), make('w169','butter','sariyog\''),
        make('w170','oil','yog\''), make('w171','sugar','shakar'), make('w172','salt','tuz'),
        make('w173','water','suv'), make('w174','tea','choy'), make('w175','coffee','qahva'),
        make('w176','juice','sharbat'), make('w177','soup','sho\'rva'), make('w178','salad','salat'),
        make('w179','cake','tort'), make('w180','chocolate','shokolad'), make('w181','candy','konfet'),
        make('w182','ice cream','muzqaymoq'), make('w183','sandwich','sendvich'), make('w184','pizza','pitsa'),
        make('w185','flour','un'), make('w186','honey','asal'), make('w187','yogurt','qatiq'),

        // ── KIYIM-KECHAK ──
        make('w188','shirt','ko\'ylak'), make('w189','trousers','shim'), make('w190','dress','ko\'ylak, ko\'z'),
        make('w191','jacket','kurtka'), make('w192','coat','palto'), make('w193','shoes','oyoq kiyim'),
        make('w194','boots','etik'), make('w195','hat','shlyapa'), make('w196','scarf','sharf'),
        make('w197','gloves','qo\'lqop'), make('w198','socks','paypoq'), make('w199','skirt','yubka'),
        make('w200','tie','galstuk'),

        // ── TABIAT VA OB-HAVO ──
        make('w201','sun','quyosh'), make('w202','moon','oy'), make('w203','star','yulduz'),
        make('w204','sky','osmon'), make('w205','cloud','bulut'), make('w206','rain','yomg\'ir'),
        make('w207','snow','qor'), make('w208','wind','shamol'), make('w209','storm','bo\'ron'),
        make('w210','thunder','momaqaldiroq'), make('w211','lightning','chaqmoq'), make('w212','fog','tuman'),
        make('w213','ice','muz'), make('w214','mountain','tog\''), make('w215','river','daryo'),
        make('w216','lake','ko\'l'), make('w217','sea','dengiz'), make('w218','ocean','okean'),
        make('w219','desert','cho\'l'), make('w220','forest','o\'rmon'), make('w221','tree','daraxt'),
        make('w222','flower','gul'), make('w223','grass','o\'t'), make('w224','leaf','barg'),
        make('w225','stone','tosh'), make('w226','earth','tuproq, yer'), make('w227','fire','olov'),
        make('w228','air','havo'), make('w229','spring','bahor'), make('w230','summer','yoz'),
        make('w231','autumn','kuz'), make('w232','winter','qish'),

        // ── VAQT ──
        make('w233','second','soniya'), make('w234','minute','daqiqa'), make('w235','hour','soat'),
        make('w236','day','kun'), make('w237','week','hafta'), make('w238','month','oy'),
        make('w239','year','yil'), make('w240','morning','ertalab'), make('w241','afternoon','tushdan keyin'),
        make('w242','evening','kechqurun'), make('w243','night','kecha'), make('w244','today','bugun'),
        make('w245','yesterday','kecha'), make('w246','tomorrow','ertaga'), make('w247','now','hozir'),
        make('w248','Monday','dushanba'), make('w249','Tuesday','seshanba'), make('w250','Wednesday','chorshanba'),
        make('w251','Thursday','payshanba'), make('w252','Friday','juma'), make('w253','Saturday','shanba'),
        make('w254','Sunday','yakshanba'),

        // ── SONLAR ──
        make('w255','one','bir'), make('w256','two','ikki'), make('w257','three','uch'),
        make('w258','four','to\'rt'), make('w259','five','besh'), make('w260','six','olti'),
        make('w261','seven','yetti'), make('w262','eight','sakkiz'), make('w263','nine','to\'qqiz'),
        make('w264','ten','o\'n'), make('w265','hundred','yuz'), make('w266','thousand','ming'),
        make('w267','million','million'), make('w268','first','birinchi'), make('w269','last','oxirgi'),

        // ── FE'LLAR (HARAKATLAR) ──
        make('w270','go','bormoq'), make('w271','come','kelmoq'), make('w272','run','yugurmoq'),
        make('w273','walk','yurmoq'), make('w274','eat','yemoq'), make('w275','drink','ichmoq'),
        make('w276','sleep','uxlamoq'), make('w277','wake','uyg\'onmoq'), make('w278','sit','o\'tirmoq'),
        make('w279','stand','turmoq'), make('w280','read','o\'qimoq'), make('w281','write','yozmoq'),
        make('w282','speak','gapirmoq'), make('w283','listen','tinglamoq'), make('w284','see','ko\'rmoq'),
        make('w285','hear','eshitmoq'), make('w286','think','o\'ylamoq'), make('w287','know','bilmoq'),
        make('w288','learn','o\'rganmoq'), make('w289','teach','o\'rgatmoq'), make('w290','work','ishlashmoq'),
        make('w291','play','o\'ynamoq'), make('w292','sing','qo\'shiq aytmoq'), make('w293','dance','o\'ynamoq, raqsga tushmoq'),
        make('w294','cook','pishirmoq'), make('w295','clean','tozalamoq'), make('w296','buy','sotib olmoq'),
        make('w297','sell','sotmoq'), make('w298','help','yordam bermoq'), make('w299','love','sevmoq'),
        make('w300','want','xohlamoq'), make('w301','need','kerak bo\'lmoq'), make('w302','give','bermoq'),
        make('w303','take','olmoq'), make('w304','open','ochmoq'), make('w305','close','yopmoq'),
        make('w306','start','boshlash'), make('w307','stop','to\'xtatmoq'), make('w308','finish','tugatmoq'),
        make('w309','try','urinmoq'), make('w310','understand','tushunmoq'), make('w311','remember','eslamoq'),
        make('w312','forget','unutmoq'), make('w313','find','topmoq'), make('w314','lose','yo\'qotmoq'),
        make('w315','win','g\'alabaga erishmoq'), make('w316','use','ishlatmoq'), make('w317','make','yasaish'),
        make('w318','show','ko\'rsatmoq'), make('w319','ask','so\'ramoq'), make('w320','answer','javob bermoq'),
        make('w321','travel','sayohat qilmoq'), make('w322','drive','haydamoq'), make('w323','fly','uchmoq'),
        make('w324','swim','suzmoq'), make('w325','jump','sakramoq'), make('w326','laugh','kulmoq'),
        make('w327','cry','yig\'lamoq'), make('w328','smile','jilmaymoq'), make('w329','think','fikrlamoq'),
        make('w330','dream','orzu qilmoq'),

        // ── SIFATLAR ──
        make('w331','big','katta'), make('w332','small','kichik'), make('w333','long','uzun'),
        make('w334','short','qisqa'), make('w335','tall','baland'), make('w336','fast','tez'),
        make('w337','slow','sekin'), make('w338','hot','issiq'), make('w339','cold','sovuq'),
        make('w340','warm','iliq'), make('w341','cool','salqin'), make('w342','new','yangi'),
        make('w343','old','eski, qari'), make('w344','young','yosh'), make('w345','good','yaxshi'),
        make('w346','bad','yomon'), make('w347','beautiful','chiroyli'), make('w348','ugly','xunuk'),
        make('w349','clean','toza'), make('w350','dirty','iflos'), make('w351','strong','kuchli'),
        make('w352','weak','kuchsiz'), make('w353','rich','boy'), make('w354','poor','kambag\'al'),
        make('w355','happy','xursand, baxtli'), make('w356','sad','xafa, g\'amgin'), make('w357','angry','g\'azablangan'),
        make('w358','tired','charchagan'), make('w359','hungry','och'), make('w360','thirsty','chanqagan'),
        make('w361','easy','oson'), make('w362','difficult','qiyin'), make('w363','important','muhim'),
        make('w364','interesting','qiziqarli'), make('w365','boring','zerikarli'), make('w366','funny','kulgili'),
        make('w367','serious','jiddiy'), make('w368','safe','xavfsiz'), make('w369','dangerous','xavfli'),
        make('w370','healthy','sog\'lom'), make('w371','sick','kasal'), make('w372','right','to\'g\'ri'),
        make('w373','wrong','noto\'g\'ri'), make('w374','busy','band'), make('w375','free','erkin, bo\'sh'),
        make('w376','open','ochiq'), make('w377','closed','yopiq'), make('w378','full','to\'la'),
        make('w379','empty','bo\'sh'), make('w380','heavy','og\'ir'), make('w381','light','engil'),

        // ── TEXNOLOGIYA ──
        make('w382','computer','kompyuter'), make('w383','phone','telefon'), make('w384','internet','internet'),
        make('w385','website','veb-sayt'), make('w386','application','ilova'), make('w387','software','dastur'),
        make('w388','keyboard','klaviatura'), make('w389','screen','ekran'), make('w390','battery','batareya'),
        make('w391','camera','kamera'), make('w392','message','xabar'), make('w393','email','elektron pochta'),
        make('w394','password','parol'), make('w395','download','yuklab olmoq'), make('w396','upload','yuklash'),
        make('w397','search','qidirmoq'), make('w398','network','tarmoq'), make('w399','wireless','simsiz'),
        make('w400','data','ma\'lumot'),

        // ── MAKTAB VA TA'LIM ──
        make('w401','lesson','dars'), make('w402','homework','uy vazifasi'), make('w403','exam','imtihon'),
        make('w404','grade','baho'), make('w405','book','kitob'), make('w406','notebook','daftar'),
        make('w407','pen','qalam'), make('w408','pencil','oddiy qalam'), make('w409','ruler','chizg\'ich'),
        make('w410','science','fan'), make('w411','math','matematika'), make('w412','history','tarix'),
        make('w413','geography','geografiya'), make('w414','biology','biologiya'), make('w415','physics','fizika'),
        make('w416','chemistry','kimyo'), make('w417','literature','adabiyot'), make('w418','library','kutubxona'),
        make('w419','dictionary','lug\'at'), make('w420','university','universitet'),

        // ── IQTISODIYOT VA PESA ──
        make('w421','money','pul'), make('w422','price','narx'), make('w423','expensive','qimmat'),
        make('w424','cheap','arzon'), make('w425','salary','maosh'), make('w426','tax','soliq'),
        make('w427','profit','foyda'), make('w428','loss','zarar'), make('w429','trade','savdo'),
        make('w430','business','biznes'), make('w431','company','kompaniya'), make('w432','job','ish'),
        make('w433','career','kasb, karyera'), make('w434','employee','xodim'), make('w435','boss','xo\'jayin, rahbar'),

        // ── SPORT ──
        make('w436','football','futbol'), make('w437','basketball','basketbol'), make('w438','tennis','tennis'),
        make('w439','swimming','suzish'), make('w440','running','yugurish'), make('w441','cycling','velosipedda yurish'),
        make('w442','boxing','boks'), make('w443','wrestling','kurash'), make('w444','volleyball','voleybol'),
        make('w445','gym','sport zal'), make('w446','ball','to\'p'), make('w447','team','jamoa'),
        make('w448','match','o\'yin, match'), make('w449','score','hisob'), make('w450','champion','chempion'),

        // ── SOG\'LIQ ──
        make('w451','health','salomatlik'), make('w452','medicine','dori'), make('w453','pain','og\'riq'),
        make('w454','fever','isitma'), make('w455','headache','bosh og\'riq'), make('w456','cold','shamollash'),
        make('w457','flu','gripp'), make('w458','surgery','jarrohlik'), make('w459','vaccine','emlash, vaktsina'),
        make('w460','vitamin','vitamin'), make('w461','diet','dieta'), make('w462','exercise','mashq'),
        make('w463','rest','dam olish'), make('w464','sleep','uyqu'),

        // ── TUYG\'ULAR ──
        make('w465','love','sevgi'), make('w466','hate','nafrat'), make('w467','fear','qo\'rquv'),
        make('w468','hope','umid'), make('w469','joy','quvonch'), make('w470','sadness','qayg\'u'),
        make('w471','anger','g\'azab'), make('w472','surprise','hayrat'), make('w473','pride','g\'urur'),
        make('w474','shame','uyat'), make('w475','jealousy','hasad, rashk'), make('w476','trust','ishonch'),
        make('w477','patience','sabr'), make('w478','courage','jasurlik'), make('w479','kindness','mehribonlik'),
        make('w480','honesty','halollik'),

        // ── KO\'P ISHLATILADIGAN SO'ZLAR ──
        make('w481','yes','ha'), make('w482','no','yo\'q'), make('w483','please','iltimos'),
        make('w484','thank you','rahmat'), make('w485','sorry','kechirasiz'), make('w486','hello','salom'),
        make('w487','goodbye','xayr'), make('w488','morning','ertalab'), make('w489','welcome','xush kelibsiz'),
        make('w490','help','yordam'), make('w491','problem','muammo'), make('w492','question','savol'),
        make('w493','answer','javob'), make('w494','idea','g\'oya'), make('w495','plan','reja'),
        make('w496','dream','orzu'), make('w497','goal','maqsad'), make('w498','success','muvaffaqiyat'),
        make('w499','failure','muvaffaqiyatsizlik'), make('w500','opportunity','imkoniyat'),
        make('w501','change','o\'zgarish'), make('w502','choice','tanlov'), make('w503','decision','qaror'),
        make('w504','result','natija'), make('w505','reason','sabab'), make('w506','way','yo\'l, usul'),
        make('w507','world','dunyo'), make('w508','life','hayot'), make('w509','death','o\'lim'),
        make('w510','peace','tinchlik'), make('w511','war','urush'), make('w512','freedom','erkinlik'),
        make('w513','power','kuch, hokimiyat'), make('w514','knowledge','bilim'), make('w515','truth','haqiqat'),
        make('w516','culture','madaniyat'), make('w517','tradition','an\'ana'), make('w518','history','tarix'),
        make('w519','future','kelajak'), make('w520','past','o\'tmish'),
    ];
    return [
        { id: 'f_general',   name: 'Umumiy lug\'at', createdAt: new Date().toISOString(), words: words.slice(0,   100) },
        { id: 'f_verbs',     name: 'Fe\'llar',        createdAt: new Date().toISOString(), words: words.slice(100, 200) },
        { id: 'f_adjectives',name: 'Sifatlar',        createdAt: new Date().toISOString(), words: words.slice(200, 300) },
        { id: 'f_daily',     name: 'Kundalik hayot',  createdAt: new Date().toISOString(), words: words.slice(300, 420) },
        { id: 'f_all',       name: 'Barcha so\'zlar', createdAt: new Date().toISOString(), words: words },
    ];
}

/* ============================================================
   ROUTING
   ============================================================ */
function switchView(viewId) {
    views.forEach(v => v.classList.remove('active'));
    const el = document.getElementById(viewId);
    if (el) el.classList.add('active');

    // Sync bottom nav highlight
    navBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.view === viewId);
    });
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
function setupEvents() {
    // Theme & home
    themeToggle.addEventListener('click', toggleTheme);
    btnGoHome.addEventListener('click', goHome);
    headerLogo.addEventListener('click', goHome);

    // Bottom nav
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const v = btn.dataset.view;
            if (v === 'view-folders') { renderFoldersList(); }
            if (v === 'view-search')  { globalInput.value = ''; renderSearchResults(''); setTimeout(() => globalInput.focus(), 100); }
            switchView(v);
        });
    });

    // Create folder
    btnNewFolder.addEventListener('click', () => {
        tempWords = [];
        createEng.value = '';
        createUz.value = '';
        renderCreateList();
        switchView('view-create-folder');
        setTimeout(() => createEng.focus(), 100);
    });
    btnCreateAdd.addEventListener('click', addToTempList);
    createEng.addEventListener('keydown', e => { if (e.key === 'Enter') createUz.focus(); });
    createUz.addEventListener('keydown',  e => { if (e.key === 'Enter') addToTempList(); });
    btnFinish.addEventListener('click', finishCreateFolder);
    btnCancelCreate.addEventListener('click', () => {
        if (tempWords.length && !confirm("Kiritilgan so'zlar saqlanmaydi. Davom etasizmi?")) return;
        goHome();
    });

    // Edit folder
    btnEditAdd.addEventListener('click', addToEditFolder);
    editEng.addEventListener('keydown', e => { if (e.key === 'Enter') editUz.focus(); });
    editUz.addEventListener('keydown',  e => { if (e.key === 'Enter') addToEditFolder(); });
    editSearch.addEventListener('input', renderEditList);
    btnBackEdit.addEventListener('click', goHome);

    // Study folder
    studySearch.addEventListener('input', () => renderStudyList());
    btnBackStudy.addEventListener('click', goHome);

    // Global search — live results as user types
    globalInput.addEventListener('input', () => renderSearchResults(globalInput.value.trim().toLowerCase()));

    // Practice
    btnCheck.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            if (!btnCheck.classList.contains('hidden')) checkAnswer();
            else if (!btnNext.classList.contains('hidden')) nextQuestion();
        }
    });
    btnNext.addEventListener('click', nextQuestion);
    btnReset.addEventListener('click', () => { sessionCorrect = 0; sessionTotal = 0; updateStats(); nextQuestion(); });
    btnStop.addEventListener('click', goHome);
    btnSpeak.addEventListener('click', () => { if (currentQuestionWord) speak(currentQuestionWord.english); });

    // Restore saved practice direction
    const saved = localStorage.getItem('practice_dir');
    if (saved) { for (const r of radioDir) if (r.value === saved) r.checked = true; }
    for (const r of radioDir) {
        r.addEventListener('change', () => {
            localStorage.setItem('practice_dir', r.value);
            if (currentPracticeFolder) nextQuestion();
        });
    }
}

function goHome() {
    switchView('view-folders');
    renderFoldersList();
    // Also sync nav to folders
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.view === 'view-folders'));
}

/* ============================================================
   FOLDERS VIEW
   ============================================================ */
function renderFoldersList() {
    foldersList.innerHTML = '';
    if (folders.length === 0) {
        foldersEmpty.classList.remove('hidden');
        foldersList.classList.add('hidden');
        return;
    }
    foldersEmpty.classList.add('hidden');
    foldersList.classList.remove('hidden');

    folders.forEach(folder => {
        const card = document.createElement('div');
        card.className = 'folder-card';
        card.innerHTML = `
            <div class="folder-header-info">
                <span class="folder-name">${esc(folder.name)}</span>
                <span class="folder-count">${folder.words.length} so'z</span>
            </div>
            <div class="folder-card-actions">
                <button class="primary-btn btn-mashq" data-id="${folder.id}">Mashq</button>
                <button class="secondary-btn btn-organish" data-id="${folder.id}">O'rganish</button>
                <button class="secondary-btn btn-sozlar" data-id="${folder.id}">So'zlar</button>
            </div>
            <button class="secondary-btn btn-delete-folder full-width" data-id="${folder.id}">Papkani o'chirish</button>
        `;
        foldersList.appendChild(card);
    });

    foldersList.querySelectorAll('.btn-mashq').forEach(b => b.addEventListener('click', () => {
        const f = findFolder(b.dataset.id);
        if (f) startPractice(f);
    }));
    foldersList.querySelectorAll('.btn-organish').forEach(b => b.addEventListener('click', () => {
        const f = findFolder(b.dataset.id);
        if (f) openStudy(f);
    }));
    foldersList.querySelectorAll('.btn-sozlar').forEach(b => b.addEventListener('click', () => {
        const f = findFolder(b.dataset.id);
        if (f) openEdit(f);
    }));
    foldersList.querySelectorAll('.btn-delete-folder').forEach(b => b.addEventListener('click', () => {
        const f = findFolder(b.dataset.id);
        if (f && confirm(`"${f.name}" lug'atini o'chirishni tasdiqlaysizmi?`)) {
            folders = folders.filter(x => x.id !== b.dataset.id);
            saveFolders();
            renderFoldersList();
            showToast("Lug'at o'chirildi", 'success');
        }
    }));
}

function findFolder(id) { return folders.find(f => f.id === id); }

/* ============================================================
   CREATE FOLDER
   ============================================================ */
function addToTempList() {
    const eng = createEng.value.trim();
    const uz  = createUz.value.trim();
    if (!eng || !uz) { showToast("So'z va tarjimani kiriting!", 'error'); return; }
    if (tempWords.some(w => w.english.toLowerCase() === eng.toLowerCase())) {
        showToast("Bu so'z allaqachon kiritilgan!", 'error'); return;
    }
    tempWords.push({ id: uid(), english: eng, uzbek: uz, weight: 1, correctAttempts: 0, totalAttempts: 0 });
    renderCreateList();
    createEng.value = '';
    createUz.value = '';
    createEng.focus();
}

function renderCreateList() {
    createCount.textContent = tempWords.length;
    createList.innerHTML = '';
    if (!tempWords.length) {
        createList.innerHTML = `<div style="padding:12px;text-align:center;font-size:.83rem;color:var(--text-2)">Hali so'z kiritilmadi.</div>`;
        return;
    }
    [...tempWords].reverse().forEach(w => {
        const item = document.createElement('div');
        item.className = 'mini-word-item';
        item.innerHTML = `
            <span class="mini-word-eng">${esc(w.english)}</span>
            <span class="mini-word-uz">${esc(w.uzbek)}</span>
            <button style="background:none;border:none;color:#ef4444;font-size:.78rem;font-weight:700;cursor:pointer;text-transform:uppercase" data-id="${w.id}">O'chirish</button>
        `;
        createList.appendChild(item);
    });
    createList.querySelectorAll('button[data-id]').forEach(b => b.addEventListener('click', () => {
        tempWords = tempWords.filter(w => w.id !== b.dataset.id);
        renderCreateList();
    }));
}

function finishCreateFolder() {
    if (!tempWords.length) { showToast("Kamida 1 ta so'z kiriting!", 'error'); return; }
    const name = prompt("Lug'atga nom bering (masalan: Yangi):");
    if (name === null) return;
    const n = name.trim();
    if (!n) { showToast("Nom bo'sh bo'lishi mumkin emas!", 'error'); return; }
    folders.push({ id: uid('folder'), name: n, createdAt: new Date().toISOString(), words: tempWords });
    saveFolders();
    tempWords = [];
    goHome();
    showToast(`"${n}" lug'ati yaratildi! 🎉`, 'success');
}

/* ============================================================
   EDIT FOLDER
   ============================================================ */
function openEdit(folder) {
    currentEditFolder = folder;
    editTitle.textContent = `${folder.name} — so'zlar`;
    editEng.value = '';
    editUz.value = '';
    editSearch.value = '';
    switchView('view-edit-folder');
    renderEditList();
}

function addToEditFolder() {
    if (!currentEditFolder) return;
    const eng = editEng.value.trim();
    const uz  = editUz.value.trim();
    if (!eng || !uz) { showToast("So'z va tarjimani kiriting!", 'error'); return; }
    if (currentEditFolder.words.some(w => w.english.toLowerCase() === eng.toLowerCase())) {
        showToast("Bu so'z allaqachon mavjud!", 'error'); return;
    }
    currentEditFolder.words.push({ id: uid(), english: eng, uzbek: uz, weight: 1, correctAttempts: 0, totalAttempts: 0 });
    saveFolders();
    renderEditList();
    editEng.value = '';
    editUz.value = '';
    editEng.focus();
    showToast("So'z qo'shildi!", 'success');
}

function renderEditList() {
    if (!currentEditFolder) return;
    const q = editSearch.value.trim().toLowerCase();
    const words = currentEditFolder.words.filter(w =>
        w.english.toLowerCase().includes(q) || w.uzbek.toLowerCase().includes(q)
    );
    editList.innerHTML = '';
    if (!currentEditFolder.words.length) {
        editList.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-2);font-size:.85rem">Bu lug'atda so'z yo'q.</div>`;
        return;
    }
    if (!words.length) {
        editList.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-2);font-size:.85rem">Hech narsa topilmadi.</div>`;
        return;
    }
    words.forEach(w => {
        const item = document.createElement('div');
        item.className = 'word-item';
        item.innerHTML = `
            <div class="word-details">
                <span class="word-eng">${esc(w.english)}</span>
                <span class="word-uz">${esc(w.uzbek)}</span>
                <span class="word-stats">Vazni: ${w.weight || 1} | To'g'ri: ${w.correctAttempts || 0}/${w.totalAttempts || 0}</span>
            </div>
            <button class="btn-delete-word" data-id="${w.id}" title="O'chirish">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        editList.appendChild(item);
    });
    editList.querySelectorAll('.btn-delete-word').forEach(b => b.addEventListener('click', () => {
        const word = currentEditFolder.words.find(x => x.id === b.dataset.id);
        if (word && confirm(`"${word.english}" so'zini o'chirasizmi?`)) {
            currentEditFolder.words = currentEditFolder.words.filter(x => x.id !== b.dataset.id);
            saveFolders();
            renderEditList();
            showToast("O'chirildi", 'success');
        }
    }));
}

/* ============================================================
   STUDY FOLDER (O'RGANISH)
   ============================================================ */
function openStudy(folder) {
    currentStudyFolder = folder;
    studyTitle.textContent = `${folder.name} — o'rganish`;
    studySearch.value = '';
    switchView('view-study-folder');
    renderStudyList();
}

function renderStudyList() {
    if (!currentStudyFolder) return;
    const q = studySearch.value.trim().toLowerCase();
    const words = currentStudyFolder.words.filter(w =>
        w.english.toLowerCase().includes(q) || w.uzbek.toLowerCase().includes(q)
    );
    studyList.innerHTML = '';
    if (!words.length) {
        studyList.innerHTML = `<div style="padding:30px;text-align:center;color:var(--text-2);font-size:.85rem">Hech narsa topilmadi.</div>`;
        return;
    }
    words.forEach(w => {
        const card = document.createElement('div');
        card.className = 'study-card';
        card.innerHTML = `
            <div class="study-card-text">
                <span class="study-eng">${esc(w.english)}</span>
                <span class="study-pronunciation">[ ${phonetic(w.english)} ]</span>
                <span class="study-uz">${esc(w.uzbek)}</span>
            </div>
            <button class="btn-speak-study" data-word="${esc(w.english)}" title="Talaffuzni tinglash">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </button>
        `;
        studyList.appendChild(card);
    });
    studyList.querySelectorAll('.btn-speak-study').forEach(b => {
        b.addEventListener('click', () => speak(b.dataset.word));
    });
}

/* ============================================================
   GLOBAL SEARCH (QIDIRUV)
   ============================================================ */
function renderSearchResults(query) {
    globalResults.innerHTML = '';
    if (!query) {
        globalResults.innerHTML = `
            <div class="search-hint">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <p>Inglizcha yoki o'zbekcha so'z kiriting...</p>
            </div>`;
        return;
    }

    const results = [];
    folders.forEach(folder => {
        folder.words.forEach(w => {
            if (w.english.toLowerCase().includes(query) || w.uzbek.toLowerCase().includes(query)) {
                results.push({ word: w, folderName: folder.name });
            }
        });
    });

    if (!results.length) {
        globalResults.innerHTML = `<div class="no-results">Hech qanday so'z topilmadi.<br><small style="color:var(--text-3)">"${esc(query)}" bo'yicha natija yo'q</small></div>`;
        return;
    }

    results.forEach(({ word: w, folderName }) => {
        const card = document.createElement('div');
        card.className = 'search-result-card';
        card.innerHTML = `
            <div class="result-texts">
                <span class="result-eng">${esc(w.english)}</span>
                <span class="result-pronunciation">[ ${phonetic(w.english)} ]</span>
                <span class="result-uz">${esc(w.uzbek)}</span>
                <span class="result-folder">📂 ${esc(folderName)}</span>
            </div>
            <button class="btn-speak-study" data-word="${esc(w.english)}" title="Talaffuzni tinglash">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </button>
        `;
        globalResults.appendChild(card);
    });

    globalResults.querySelectorAll('.btn-speak-study').forEach(b => {
        b.addEventListener('click', () => speak(b.dataset.word));
    });
}

/* ============================================================
   PRACTICE
   ============================================================ */
function startPractice(folder) {
    if (!folder.words.length) { showToast("Bu papkada so'z yo'q!", 'error'); return; }
    currentPracticeFolder = folder;
    practiceFolderTitle.textContent = `${folder.name} — mashq`;
    sessionCorrect = 0;
    sessionTotal = 0;
    updateStats();
    switchView('view-practice');
    nextQuestion();
}

function nextQuestion() {
    if (!currentPracticeFolder || !currentPracticeFolder.words.length) return;

    const words = currentPracticeFolder.words;
    let selected = null;

    if (words.length === 1) {
        selected = words[0];
    } else {
        const total = words.reduce((s, w) => s + (w.weight || 1), 0);
        let rand = Math.random() * total;
        let running = 0;
        for (const w of words) {
            running += (w.weight || 1);
            if (rand <= running) {
                if (currentQuestionWord && w.id === currentQuestionWord.id && Math.random() < 0.75) continue;
                selected = w;
                break;
            }
        }
        if (!selected) selected = words[Math.floor(Math.random() * words.length)];
    }

    currentQuestionWord = selected;

    // Determine direction
    let dir = 'en-uz';
    for (const r of radioDir) if (r.checked) { dir = r.value; break; }
    if (dir === 'random') dir = Math.random() < 0.5 ? 'en-uz' : 'uz-en';

    // Hide translation
    transDisplay.classList.add('hidden');
    transDisplay.querySelector('span').textContent = '';

    if (dir === 'en-uz') {
        currentShownLang = 'en';
        langTag.textContent = 'Inglizcha';
        wordText.textContent = selected.english;
        currentCorrectAnswer = selected.uzbek;
        btnSpeak.classList.remove('hidden');
    } else {
        currentShownLang = 'uz';
        langTag.textContent = "O'zbekcha";
        wordText.textContent = selected.uzbek;
        currentCorrectAnswer = selected.english;
        btnSpeak.classList.add('hidden');
    }

    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.className = '';
    feedback.className = 'practice-feedback hidden';
    feedback.innerHTML = '';
    btnCheck.classList.remove('hidden');
    btnNext.classList.add('hidden');
    setTimeout(() => answerInput.focus(), 80);
}

function checkAnswer() {
    if (!currentQuestionWord) return;
    const user = answerInput.value.trim().toLowerCase();
    if (!user) { answerInput.focus(); return; }

    const correctList = currentCorrectAnswer.toLowerCase().split(',').map(a => a.trim());
    const isCorrect = correctList.some(c => user === c);

    currentQuestionWord.weight = isCorrect
        ? Math.max(1, (currentQuestionWord.weight || 1) - 1)
        : (currentQuestionWord.weight || 1) + 3;
    currentQuestionWord.totalAttempts = (currentQuestionWord.totalAttempts || 0) + 1;
    if (isCorrect) { currentQuestionWord.correctAttempts = (currentQuestionWord.correctAttempts || 0) + 1; sessionCorrect++; }
    sessionTotal++;
    saveFolders();
    updateStats();

    // Always show translation at top
    transDisplay.querySelector('span').textContent = currentCorrectAnswer;
    transDisplay.classList.remove('hidden');

    answerInput.disabled = true;
    btnCheck.classList.add('hidden');
    btnNext.classList.remove('hidden');
    btnNext.focus();

    feedback.classList.remove('hidden');
    if (isCorrect) {
        answerInput.className = 'success-input';
        feedback.className = 'practice-feedback success';
        feedback.innerHTML = `<h5>✓ TO'G'RI!</h5><p>Javobingiz: ${esc(answerInput.value)}</p>`;
        if (currentShownLang === 'en') speak(currentQuestionWord.english);
    } else {
        answerInput.className = 'error-input';
        feedback.className = 'practice-feedback error';
        feedback.innerHTML = `<h5>✗ NOTO'G'RI</h5><p>Siz: <s>${esc(answerInput.value)}</s> → To'g'ri: <strong>${esc(currentCorrectAnswer)}</strong></p>`;
    }
}

function updateStats() {
    correctCount.textContent = sessionCorrect;
    totalCount.textContent   = sessionTotal;
}

/* ============================================================
   TEXT-TO-SPEECH
   ============================================================ */
function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.lang.startsWith('en'));
    if (v) utt.voice = v;
    window.speechSynthesis.speak(utt);
}

/* ============================================================
   SIMPLE PHONETIC HINT (for display only, not real IPA)
   Shows a readable pronunciation approximation
   ============================================================ */
function phonetic(word) {
    // Map common English letter patterns to a simple readable form
    return word
        .toLowerCase()
        .replace(/tion/g, 'shn')
        .replace(/ph/g,   'f')
        .replace(/gh/g,   '')
        .replace(/ck/g,   'k')
        .replace(/ee/g,   'ii')
        .replace(/oo/g,   'uu')
        .replace(/ea/g,   'ii')
        .replace(/ou/g,   'aw')
        .replace(/th/g,   'ð')
        .replace(/sh/g,   'ʃ')
        .replace(/ch/g,   'tʃ')
        .replace(/wh/g,   'w')
        .replace(/ng/g,   'ŋ')
        .replace(/r/g,    'r')
        .replace(/e$/, '');
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.className = `toast-feedback ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ============================================================
   HELPERS
   ============================================================ */
function esc(str) {
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
        .replace(/'/g,'&#039;');
}
function uid(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
}
