// @ts-check

/** Codes are processed in the order they are listed here and the first match is used. */
export const languageCodes: Record<string, string> = {
    'en': 'english',
    'de': 'german',
    'zh_TW': 'chinese_traditional',
    'zh_HK': 'chinese_traditional',
    'zh_HANT': 'chinese_traditional',
    'zh': 'chinese_simplified',
    'fr': 'french',
    'es': 'spanish',
    'pt-br': 'brazilian',
    'ru': 'russian',
    'ko': 'korean',
    'ja': 'japanese',    
    'it': 'italien',    
    'pl': 'polish'
}

export const texts: Record<string, Record<string, string>> = {
    residents: {
        "french": "Résidents",
        "english": "Residents",
        "italian": "Residenti",
        "simplified_chinese": "居民",
        "spanish": "Residentes",
        "japanese": "住民",
        "traditional_chinese": "居民",
        "polish": "Mieszkańcy",
        "german": "Einwohner",
        "korean": "주민",
        "russian": "Жители",
        "brazilian": "Residentes"
    },
 
    workforce: {
        english: "Required Workforce",
        french: "Main-d'œuvre requise",
        polish: "Wymagana siła robocza",
        spanish: "Mano de obra requerida",
        italian: "Forza lavoro richiesta",
        german: "Benötigte Arbeitskraft",
        brazilian: "Força de trabalho necessária",
        russian: "Требуемая рабочая сила",
        simplified_chinese: "所需劳动力",
        traditional_chinese: "所需勞動力",
        japanese: "必要な労働力",
        korean: "필요한 인력"
    },
    itemsEquipped: {
        "english": "Items Equipped",
        "simplified_chinese": "已装备物品",
        "traditional_chinese": "已裝備物品",
        "italian": "Oggetti in uso",
        "spanish": "Objetos equipados",
        "german": "Ausgerüstete Items",
        "polish": "Przedmioty w użyciu",
        "french": "Objets en stock",
        "korean": "배치한 아이템",
        "japanese": "装備したアイテム",
        "russian": "Используемые предметы",
        "brazilian": "Itens equipados"
    },
    extraGoods: {
        "english": "Extra Goods",
        "simplified_chinese": "额外货物",
        "traditional_chinese": "額外貨物",
        "italian": "Merci aggiuntive",
        "spanish": "Bienes extra",
        "german": "Zusatzwaren",
        "polish": "Dodatkowe towary",
        "french": "Marchandises supplémentaires",
        "korean": "추가 물품",
        "japanese": "追加品物",
        "russian": "Дополнительные товары",
        "brazilian": "Bens extras"
    },
    "devotion": {
        "english": "Devotion",
        "simplified_chinese": "虔诚度",
        "traditional_chinese": "虔誠度",
        "italian": "Devozione",
        "spanish": "Devoción",
        "german": "Hingabe",
        "polish": "Oddanie",
        "french": "Dévotion",
        "korean": "헌신도",
        "japanese": "献身度",
        "russian": "Преданность"
    },

    "milestone": {
        "english": "Milestone",
        "simplified_chinese": "里程碑",
        "traditional_chinese": "里程碑",
        "italian": "Traguardo",
        "spanish": "Hito",
        "german": "Meilenstein",
        "polish": "Kamień milowy",
        "french": "Étape",
        "korean": "이정표",
        "japanese": "マイルストーン",
        "russian": "Этап"
    },
    "devotionRequired": {
        "english": "Devotion Required",
        "simplified_chinese": "需要虔诚度",
        "traditional_chinese": "需要虔誠度",
        "italian": "Devozione Richiesta",
        "spanish": "Devoción Requerida",
        "german": "Benötigte Hingabe",
        "polish": "Wymagane Oddanie",
        "french": "Dévotion Requise",
        "korean": "필요한 헌신도",
        "japanese": "必要な献身度",
        "russian": "Необходимая преданность"
    },
    "scaling": {
        "english": "Scaling",
        "simplified_chinese": "缩放",
        "traditional_chinese": "縮放",
        "italian": "Scala",
        "spanish": "Escala",
        "german": "Skalierung",
        "polish": "Skalowanie",
        "french": "Échelle",
        "korean": "스케일링",
        "japanese": "スケーリング",
        "russian": "Масштабирование"
    },

    "bonusResidents": {
        "simplified_chinese": "额外居民",
        "english": "Bonus Residents",
        "french": "Habitants supplémentaires",
        "german": "Zusätzliche Einwohner",
        //"guid": 22286,
        "italian": "Residenti bonus",
        "japanese": "ボーナス住民",
        "korean": "보너스 주민",
        "polish": "Dodatkowi mieszkańcy",
        "russian": "Дополнительное количество жителей",
        "spanish": "Bonificación de residentes",
        "traditional_chinese": "額外居民"
    },
    "bonusSupply": {
        "simplified_chinese": "额外供给",
        "english": "Bonus Supply",
        "french": "Bonus de ravitaillement",
        "german": "Zusatzversorgung",
        //"guid": 12315,
        "italian": "Bonus offerta",
        "japanese": "ボーナス供給",
        "korean": "보너스 제공",
        "polish": "Dodatkowe zaopatrzenie",
        "russian": "Дополнительное снабжение",
        "spanish": "Bonificación de suministros",
        "traditional_chinese": "額外供給"
    },
    "reduceConsumption": {
        "simplified_chinese": "降低消耗量",
        "english": "Reduce Consumption",
        "french": "Réduire la consommation",
        "german": "Verbrauch reduzieren",
        //"guid": 134956,
        "italian": "Riduci consumo",
        "japanese": "消費量を減らす",
        "korean": "소비 감소",
        "polish": "Zredukuj konsumpcję",
        "russian": "Снижение уровня потребления",
        "spanish": "Reducir consumo",
        "traditional_chinese": "降低消耗量"
    },


    "islands": {
        "english": "Islands",
        "simplified_chinese": "岛屿",
        "traditional_chinese": "島嶼",
        "italian": "Isole",
        "spanish": "Islas",
        "german": "Inseln",
        "polish": "Wyspy",
        "french": "Îles",
        "korean": "섬",
        "japanese": "島",
        "russian": "Острова"
    },
    "deleteAll": {
        "english": "Delete All",
        "simplified_chinese": "删除全部",
        "traditional_chinese": "刪除全部",
        "italian": "Cancella tutto",
        "spanish": "Borrar todo",
        "german": "Alles löschen",
        "polish": "Skasuj wszystko",
        "french": "Supprimer tout",
        "korean": "모두 삭제",
        "japanese": "すべて削除する",
        "russian": "Удалить все"
    },
    requiredNumberOfBuildings: {
        english: "Required Number of Buildings",
        french: "Nombre de bâtiments requis",
        polish: "Wymagana liczba budynków",
        spanish: "Número de edificios requeridos",
        italian: "Numero di edifici richiesti",
        german: "Benötigte Anzahl an Gebäuden",
        brazilian: "Número de edifícios necessários",
        russian: "Требуемое количество зданий",
        simplified_chinese: "所需建筑数量",
        traditional_chinese: "所需建築數量",
        japanese: "必要な建物の数",
        korean: "필요한 건물 수"
    },
    existingNumberOfBuildings: {
        english: "Existing Number of Buildings",
        french: "Nombre de bâtiments existants",
        polish: "Istniejąca liczba budynków",
        spanish: "Número de edificios existentes",
        italian: "Numero di edifici esistenti",
        german: "Vorhandene Anzahl an Gebäuden",
        brazilian: "Número de edifícios existentes",
        russian: "Существующее количество зданий",
        simplified_chinese: "现有建筑数量",
        traditional_chinese: "現有建築數量",
        japanese: "既存の建物の数",
        korean: "현재 건물 수"
    },
    existingNumberOfBuildingsIs: {
        english: "Is:",
        french: "Est :",
        polish: "Jest:",
        spanish: "Es:",
        italian: "È:",
        german: "Ist:",
        brazilian: "É:",
        russian: "Есть:",
        simplified_chinese: "现有：",
        traditional_chinese: "現有：",
        japanese: "現在：",
        korean: "현재:"
    },
    requiredNumberOfBuildingsShort: {
        english: "Required:",
        french: "Requis :",
        polish: "Wymagane:",
        spanish: "Requeridos:",
        italian: "Richiesti:",
        german: "Benötigt:",
        brazilian: "Necessários:",
        russian: "Требуется:",
        simplified_chinese: "所需：",
        traditional_chinese: "所需：",
        japanese: "必要：",
        korean: "필요:"
    },
    requiredNumberOfBuildingsDescription: {
        english: "Required number of buildings to produce consumer products",
        french: "Nombre de bâtiments requis pour produire des biens de consommation",
        polish: "Wymagana liczba budynków do produkcji dóbr konsumpcyjnych",
        spanish: "Número de edificios requeridos para producir bienes de consumo",
        italian: "Numero di edifici richiesti per produrre beni di consumo",
        german: "Benötigte Gebäudeanzahl zur Produktion von Verbrauchsgütern",
        brazilian: "Número de edifícios necessários para produzir bens de consumo",
        russian: "Требуемое количество зданий для производства потребительских товаров",
        simplified_chinese: "生产消费品所需的建筑数量",
        traditional_chinese: "生產消費品所需的建築數量",
        japanese: "消費財を生産するために必要な建物の数",
        korean: "소비재 생산에 필요한 건물 수"
    },
    tonsPerMinute: {
        "english": "Tons per minute (t/min)",
        "simplified_chinese": "每分钟吨数（吨／分钟）",
        "traditional_chinese": "每分鐘噸數（噸／分鐘）",
        "italian": "Tonnellate al minuto (t/min)",
        "spanish": "Toneladas por minuto (t/min)",
        "german": "Tonnen pro Minute (t/min)",
        "polish": "Tony na minutę (t/min)",
        "french": "Tonnes par minute (t/min)",
        "korean": "톤/분(1분당 톤 수)",
        "japanese": "トン毎分 (トン/分)",
        "russian": "Тонн в минуту (т./мин.)",
        "brazilian": "Toneladas por minuto (t/min)"
    },
    setAsDefault: {
        "english": "Obtain goods from",
        "german": "Ware davon beziehen"
    },
    afterIslandCreation: {
        "english": "After creation:",
        "german": "Nach dem Erstellen:"
    },
    showIslandOnCreation: {
        english: "Display island",
        german: "Insel anzeigen",
    },
    "activateAllNeeds": {
        "english": "Activate all needs",
        "french": "Activer tous les besoins",
        "polish": "Aktywuj wszystkie potrzeby",
        "spanish": "Activar todas las necesidades",
        "italian": "Attiva tutti i bisogni",
        "german": "Alle Bedürfnisse aktivieren",
        "brazilian": "Ativar todas as necessidades",
        "russian": "Активировать все потребности",
        "simplified_chinese": "激活所有需求",
        "traditional_chinese": "激活所有需求",
        "japanese": "すべてのニーズを有効にする",
        "korean": "모든 요구 사항 활성화"

    },
    importDeficit: {
        english: "Import deficit",
        french: "Importer le déficit",
        polish: "Importuj deficyt",
        spanish: "Importar déficit",
        italian: "Importa deficit",
        german: "Defizit importieren",
        brazilian: "Importar déficit",
        russian: "Импортировать дефицит",
        simplified_chinese: "进口赤字",
        traditional_chinese: "進口赤字",
        japanese: "不足分をインポート",
        korean: "적자 수입"
    },
    exportOverproduction: {
        english: "Export overproduction",
        french: "Exporter la surproduction",
        polish: "Eksportuj nadprodukcję",
        spanish: "Exportar sobreproducción",
        italian: "Esporta sovrapproduzione",
        german: "Überproduktion exportieren",
        brazilian: "Exportar superprodução",
        russian: "Экспортировать перепроизводство",
        simplified_chinese: "出口过剩产品",
        traditional_chinese: "出口過剩產品",
        japanese: "過剰生産をエクスポート",
        korean: "과잉 생산 수출"
    },

    islandName: {
        english: "New island name",
        french: "Nom de la nouvelle île",
        polish: "Nazwa nowej wyspy",
        spanish: "Nombre de la nueva isla",
        italian: "Nome della nuova isola",
        german: "Neuer Inselname",
        brazilian: "Nome da nova ilha",
        russian: "Название нового острова",
        simplified_chinese: "新岛屿名称",
        traditional_chinese: "新島嶼名稱",
        japanese: "新しい島の名前",
        korean: "새로운 섬 이름"
    },
    selectedIsland: {
        english: "Selected Island",
        french: "Île sélectionnée",
        polish: "Wybrana wyspa",
        spanish: "Isla seleccionada",
        italian: "Isola selezionata",
        german: "Ausgewählte Insel",
        brazilian: "Ilha selecionada",
        russian: "Выбранный остров",
        simplified_chinese: "岛屿选择",
        traditional_chinese: "島嶼選擇",
        japanese: "選択された島",
        korean: "선택된 섬"
    },
    chooseFactories: {
        english: "Modify Production Chains",
        french: "Modifier les chaînes de production",
        polish: "Modyfikuj łańcuchy produkcyjne",
        spanish: "Modificar cadenas de producción",
        italian: "Modifica catene di produzione",
        german: "Modifiziere Produktionsketten",
        brazilian: "Modificar cadeias de produção",
        russian: "Изменить производственные цепочки",
        simplified_chinese: "修改生产链",
        traditional_chinese: "修改生產鏈",
        japanese: "生産チェーンを変更",
        korean: "생산 체인 수정"
    },
    noFixedFactory: {
        english: "Automatic: same region as consumer",
        french: "Automatique : même région que le consommateur",
        polish: "Automatycznie: ten sam region co konsument",
        spanish: "Automático: misma región que el consumidor",
        italian: "Automatico: stessa regione del consumatore",
        german: "Automatisch: gleichen Region wie Verbraucher",
        brazilian: "Automático: mesma região do consumidor",
        russian: "Автоматически: тот же регион, что и у потребителя",
        simplified_chinese: "自动：与消费者相同的地区",
        traditional_chinese: "自動：與消費者相同的地區",
        japanese: "自動：消費者と同じ地域",
        korean: "자동 : 소비자와 동일한 지역"
    },
    notes: {
        english: "Note",
        french: "Note",
        polish: "Notatka",
        spanish: "Nota",
        italian: "Nota",
        german: "Notizen",
        brazilian: "Nota",
        russian: "Заметка",
        simplified_chinese: "备注",
        traditional_chinese: "備註",
        japanese: "メモ",
        korean: "노트"
    },
    // view mode
    viewMode: {
        english: "View Mode",
        french: "Mode d'affichage",
        polish: "Tryb widoku",
        spanish: "Modo de vista",
        italian: "Modalità di visualizzazione",
        german: "Ansichtsmodus",
        brazilian: "Modo de visualização",
        russian: "Режим просмотра",
        simplified_chinese: "查看模式",
        traditional_chinese: "檢視模式",
        japanese: "表示モード",
        korean: "보기 모드"
    },
    viewStart: {
        english: "Start",
        french: "Démarrer",
        polish: "Start",
        spanish: "Comenzar",
        italian: "Inizio",
        german: "Starten",
        brazilian: "Começar",
        russian: "Начать",
        simplified_chinese: "开始",
        traditional_chinese: "開始",
        japanese: "スタート",
        korean: "시작"
    },
    viewPlan: {
        english: "Plan",
        french: "Planifier",
        polish: "Plan",
        spanish: "Planificar",
        italian: "Piano",
        german: "Planen",
        brazilian: "Planejar",
        russian: "План",
        simplified_chinese: "计划",
        traditional_chinese: "計劃",
        japanese: "プラン",
        korean: "계획"
    },
    viewMaster: {
        english: "Master",
        french: "Maître",
        polish: "Mistrz",
        spanish: "Maestro",
        italian: "Maestro",
        german: "Meistern",
        brazilian: "Mestre",
        russian: "Мастер",
        simplified_chinese: "大师",
        traditional_chinese: "大師",
        japanese: "マスター",
        korean: "마스터"
    },
    viewStartDescription: {
        english: "Start from scratch and progress through the resident tiers.",
        french: "Commencez de zéro et progressez à travers les niveaux de résidents.",
        polish: "Rozpocznij od zera i przejdź przez poziomy mieszkańców.",
        spanish: "Comienza desde cero y progresa a través de los niveles de residentes.",
        italian: "Inizia da zero e progredisci attraverso i livelli di residenti.",
        german: "Beginne von Vorne und schreite durch die Bevölkerungsstufen voran.",
        brazilian: "Comece do zero e progrida através dos níveis de residentes.",
        russian: "Начните с нуля и продвигайтесь через уровни жителей.",
        simplified_chinese: "从头开始并逐步提升居民等级。",
        traditional_chinese: "從頭開始並逐步提升居民等級。",
        japanese: "ゼロから始めて住民のレベルを進めていきます。",
        korean: "처음부터 시작하여 주민 단계를 진행하세요."
    },
    viewPlanDescription: {
        english: "The essential settings and DLCs are enabled to plan islands and huge cities.",
        french: "Les paramètres essentiels et les DLC sont activés pour planifier des îles et d'énormes cités.",
        polish: "Podstawowe ustawienia i DLC są włączone, aby planować wyspy i ogromne miasta.",
        spanish: "Las configuraciones esenciales y los DLC están habilitados para planificar islas y ciudades enormes.",
        italian: "Le impostazioni essenziali e i DLC sono abilitati per pianificare isole e città enormi.",
        german: "Die essentiellen Einstellungen und DLCs sind aktiviert, um Inseln und rießige Städte zu planen.",
        brazilian: "As configurações essenciais e DLCs estão habilitados para planejar ilhas e grandes cidades.",
        russian: "Основные настройки и DLC включены для планирования островов и огромных городов.",
        simplified_chinese: "启用了基本设置和DLC以规划岛屿和巨大城市。",
        traditional_chinese: "啟用了基本設定和DLC以規劃島嶼和巨大城市。",
        japanese: "島や巨大な都市を計画するために、必須の設定とDLCが有効になっています。",
        korean: "섬과 거대한 도시를 계획하기 위해 필수 설정과 DLC가 활성화되어 있습니다."
    },
    viewMasterDescription: {
        english: "All settings and DLCs are enabled.",
        french: "Tous les paramètres et DLC sont activés.",
        polish: "Wszystkie ustawienia i DLC są włączone.",
        spanish: "Todas las configuraciones y DLC están habilitados.",
        italian: "Tutte le impostazioni e i DLC sono abilitati.",
        german: "Alle Einstellungen und DLCs sind aktiviert.",
        brazilian: "Todas as configurações e DLCs estão habilitados.",
        russian: "Все настройки и DLC включены.",
        simplified_chinese: "所有设置和DLC均已启用。",
        traditional_chinese: "所有設定和DLC均已啟用。",
        japanese: "すべての設定とDLCが有効になっています。",
        korean: "모든 설정과 DLC가 활성화되어 있습니다."
    },

    // calculator and server management
    downloadConfig: {
        english: "Import / Export configuration.",
        french: "Importer / Exporter la configuration.",
        polish: "Importuj / Eksportuj konfigurację.",
        spanish: "Importar / Exportar configuración.",
        italian: "Importa / Esporta configurazione.",
        german: "Konfiguration importieren / exportieren.",
        brazilian: "Importar / Exportar configuração.",
        russian: "Импорт / Экспорт конфигурации.",
        simplified_chinese: "导入/导出配置。",
        traditional_chinese: "匯入/匯出配置。",
        japanese: "設定をインポート/エクスポート。",
        korean: "설정 가져오기 / 내보내기"
    },
    downloadCalculator: {
        english: "Download the calculator (source code of this website) to run it locally. To do so, extract the archive and double click index.html.",
        french: "Téléchargez le calculateur (code source de ce site) pour l'exécuter localement. Pour ce faire, extrayez l'archive et double-cliquez sur index.html.",
        polish: "Pobierz kalkulator (kod źródłowy tej witryny), aby uruchomić go lokalnie. W tym celu rozpakuj archiwum i kliknij dwukrotnie index.html.",
        spanish: "Descarga la calculadora (código fuente de este sitio web) para ejecutarla localmente. Para hacerlo, extrae el archivo y haz doble clic en index.html.",
        italian: "Scarica il calcolatore (codice sorgente di questo sito) per eseguirlo localmente. Per farlo, estrai l'archivio e fai doppio clic su index.html.",
        german: "Lade den Warenrechner (Quellcode dieser Seite) herunter, um ihn lokal auszuführen. Zum Ausführen, extrahiere das Archiv und doppelklicke auf index.html.",
        brazilian: "Baixe a calculadora (código-fonte deste site) para executá-la localmente. Para fazer isso, extraia o arquivo e clique duas vezes em index.html.",
        russian: "Загрузите калькулятор (исходный код этого сайта), чтобы запустить его локально. Для этого извлеките архив и дважды щелкните index.html.",
        simplified_chinese: "下载计算器（本网站的源代码）以在本地运行。为此，请解压存档并双击index.html。",
        traditional_chinese: "下載計算器（本網站的原始碼）以在本地執行。為此，請解壓縮檔案並雙擊index.html。",
        japanese: "計算機（このウェブサイトのソースコード）をダウンロードしてローカルで実行します。そのためには、アーカイブを解凍してindex.htmlをダブルクリックしてください。",
        korean: "Anno 계산기 (이 웹 사이트의 소스 코드)를 다운로드 하여 로컬로 실행 하십시오. 압축을 풀고 index.html 실행 하십시오."
    },
    calculatorUpdate: {
        english: "A new calculator version is available. Click the download button.",
        french: "Une nouvelle version du calculateur est disponible. Cliquez sur le bouton de téléchargement.",
        polish: "Dostępna jest nowa wersja kalkulatora. Kliknij przycisk pobierania.",
        spanish: "Hay una nueva versión de la calculadora disponible. Haga clic en el botón de descarga.",
        italian: "È disponibile una nuova versione del calcolatore. Fai clic sul pulsante di download.",
        german: "Eine neue Version des Warenrechners ist verfügbar. Klicke auf den Downloadbutton.",
        brazilian: "Uma nova versão da calculadora está disponível. Clique no botão de download.",
        russian: "Доступна новая версия калькулятора. Нажмите кнопку загрузки.",
        simplified_chinese: "新版本计算器已推出。点击下载按钮。",
        traditional_chinese: "新版本計算器已推出。點擊下載按鈕。",
        japanese: "新しいバージョンの計算機が利用可能です。ダウンロードボタンをクリックしてください。",
        korean: "새로운 Anno1800 계산기 버전이 제공됩니다. 다운로드 버튼을 클릭하십시오."
    },
    newFeature: {
        english: "",
        german: "",
    },
    helpContent: {
        german:
            `<h5>Verwendung und Aufbau</h5>
<p>Trage die aktuellen Wohnhäuser in die oberste Reihe ein. Die Produktionsketten aktualisieren sich automatisch, sobald man die Eingabe verlässt. Es werden nur diejenigen Waren angezeigt, die benötigt werden.</p>
<p>Der Buchstabe in eckigen Klammern vor dem Bevölkerungsnamen ist der <b>Hotkey</b> zum Fokussieren des Eingabefeldes. Die Anzahl dort kann ebenfalls durch Drücken der Pfeiltasten erhöht und verringert werden.</p><br/>
<p>In der darunterliegenden Reihe wird die <b>Arbeitskraft</b> angezeigt, die benötigt wird, um alle Gebäude zu betreiben (jeweils auf die nächste ganze Fabrik gerundet).</p><br/>
<p>Danach folgt ein <b>Überblick über alle benötigten Waren</b> mit Anzahl benötigter Fabriken darunter. Jeder der Abschnitte kann durch einen Klick auf die Überschrift zusammengeklappt werden.</p><br/>
<p>In jeder Kachel wird der Name der Fabrik, das Icon der hergestellten Ware, die Produktivität, die Anzahl der benötigten Gebäude und die Produktionsrate in Tonnen pro Minute angezeigt. Die Anzahl der Gebäude wird, wenn aktiviert, mit zwei Nachkommastellen angezeigt, um die Höhe der Überkapazitäten direkt ablesen zu können. Am unteren Rand der Kachel wird der (benötigte) <b>Output der Fabrik</b> angezeigt (was im Ausgangslager der Fabrik erzeugt wird plus Zusatzwaren).</p><br/>
<p>Der Abschnitt öffentliche Gebäude enthält nur diejenigen Gebäude, welche Waren verbrauchen. Für die Post aus dem Reich-der-Lüfte-DLC wird nicht die Anzahl benötigter Postbüros sondern die Bevölkerung, welche sich in Reichweite eines Postbüros befinden muss, angezeigt. Die Rezepte aus dem Reisezeit-DLC sind dabei wie folgt umgesetzt. Jedes Rezept ist durch ein eigenes Gebäude repräsentiert. Um ein Rezept zum ersten Mal zu verwenden, muss es in der Liste ausgewählt und anschließend der Plus-Button geklickt werden. Es erscheint eine neue Kachel, die sich wie ein normales Produktionsgebäude verhält. Der einzige Unterschied besteht, wenn man die Gebäudezahl auf Null setzt. Dann verschwindet die Kachel und das Rezept wird wieder der Liste hinzugefügt.</p><br/>
<p>Da <b>Baumaterialien</b> sich Zwischenmaterialien mit Konsumgütern teilen sind sie (im Gegensatz zu Warenrechnern früherer Annos) mit aufgeführt, um so den Verbrauch von Minen besser planen zu können. Es muss die Anzahl der Endbetriebe per Hand eingegeben werden.</p><br/>

<h5>Bevölkerungskonfiguration</h5>
<p>Der Button links oben bei den Bevölkerungsstufen öffnet ein separates Menü. Die angezeigten Einwohner werden automatisch anhand der Gebäude, Effekte und gewählten Bedürfnisse berechnet und wird im Regelfall nicht exakt mit den Zahlen in Anno übereinstimmen (z.B. weil Einwohner noch einziehen müssen). Gibt man dort einen Wert ein, so wird die notwendige Anzahl an Häusern geschätzt, um die Bevölkerung zu erreichen. Entsprechend wird häufig nach dem Verlassen des Eingabefeldes ein etwas anderer Wert darin stehen.</p>
<p>Durch Klick auf die Überschrift <b>Wolkenkratzer</b> bzw. <b>Alle Wohnhäuser</b> werden die Wolkenkratzerlevel bzw. <b>Hacienda-Unterkünfte</b> angezeigt. Jede Zeile enthält die Anzahl an Gebäuden, die Gesamteinwohner pro Wohnhaustyp sowie die Verbrauchseffekte. Im Tooltip der Verbrauchseffekte wird die Abdeckung angezeigt. Abgesehen von der Wolkenkratzerverwaltung unter Finanzen bietet das Spiel hier keine Hilfe. Sobald ein Wolkenkratzer gebaut ist, fungieren die darüberstehenden Angaben als Zusammenfassung und können nicht mehr geändert werden.</p><br/>
<p>Unter den Wohnhäusern folgen die Bedürfnisse, gruppiert nach Typ. Die Buttons neben den Waren (ent-)sperren das Bedürfnis. Durch das An-/Abwählen des Kontrollkästchens neben der Überschrift können alle Bedürfnisse gleichzeitig ge- oder entsperrt werden. Der Marktplatz-Button öffnet den <b>Konfigurationsdialog für Verbrauchseffekte</b>. Je nachdem welcher Button geklickt wird, wird ein anderer Filter angewandt. Der neben den Bedürfnissen zeigt nur Effekte, welche diese Bedürfnis beeinflussen sowie die Produktionskette. Der Button <b>Global Anwenden</b> übernimmt Verbrauchseffekte und gesperrte Bedürfnisse für alle Inseln.</p><br/>


<h5>Globale Einstellungen</h5>
<span class="btn-group bg-dark mr-2 float-left">
<button class="btn text-light"><span class="fa fa-adjust"> </span></button>
<button class="btn text-light"><span class="fa fa-cog"> </span></button>
<button class="btn text-light"><span class="fa fa-question-circle-o"> </span></button>
<button class="btn text-light"><span class="fa fa-download"> </span></button>
</span>
<p>Die Buttons rechts in der Navigationsleiste dienen zur Verwaltung des Warenrechners. Sie schalten in den Dark-Mode um, öffnen das Einstellungsmenü, zeigen die Hilfe oder öffnen den Download-Dialog. In den Einstellungen kann die Sprache ausgewählt und die Menge der dargestellten Informationen angepasst werden. Im <b>Downloadbereich</b> kann die <b>Konfiguration</b> (Einstellungen, Inseln, Produktivität, Gebäude, ...) importiert und exportiert werden. Außerdem können dieser Rechner sowie eine zusätzliche Serveranwendung heruntergeladen werden. Mit der <b>Serveranwendung</b> lassen sich die vorhandenen Gebäude, Inseln und Produktivitäten automatisch aus dem Spiel auslesen.</p><br/>

<h5>Konfigurationsdialog der Fabrik</h5>
<p>Der Button links oben bei den Fabriken öffnet ein detaillierteres Menü. Dort können Items ausgerüstet, Gebäude, Produktivität, Module, Effekte und Clipping ausgewählt werden. Es werden nur Items aufgeführt, die Eingangswaren oder Arbeitskräfte ersetzen oder Zusatzwaren erzeugen. Items, die in keine der drei Kategorien fallen, sind aus Gründen der Übersichtlichkeit nicht aufgeführt. Die <b>Produktivität</b> muss z. B. komplett manuell ausgerechnet und eingetragen werden. Außerdem werden in dem Dialog Handelsrouten und Handelsverträge der Speicherstadt angelegt. </p><br/>

<h5>Verbrauchseffekte, Produktionsketten und Zusatzwaren-Items</h5>
<span class="btn-group bg-dark mr-2 float-left">
<button type="button" class="btn"><img data-toggle="modal" data-target="#good-consumption-island-upgrade-dialog" class="icon-navbar" src="icons/icon_marketplace_2d_light.png" /></button>
<button class="btn text-light"><span class="fa fa-cogs"></span></button>
<button type="button" class="btn"><img data-toggle="modal" data-target="#effects-dialog" class="icon-navbar" src="icons/icon_add_goods_socket_white.png" /></button>
</span>
<p>Die Buttons hierfür befinden sich links in der Navigationsleiste.</p><br/>

<span class="btn-group bg-dark mr-2 float-left"><button type="button" class="btn"><img data-toggle="modal" data-target="#good-consumption-island-upgrade-dialog" class="icon-navbar" src="icons/icon_marketplace_2d_light.png" /></button></span>
<p>Neben der <b>Zeitung</b> können auch weitere Effekte eingestellt werden, welche den <b>Warenverbrauch verändern</b>, z. B. Zoo-Sets, Palasteffekte, Items und Effekte der öffentlichen Gebäude des Reisezeit-DLC. Während Effekt und Items pro Insel aktiviert werden, hat die Zeitung globale Auswirkung. Um das Einstellen zu erleichtern, gibt es deshalb den <b>Global Anwenden</b>-Button, der alle Effekte auf alle anderen Inseln kopiert und die vorhandenen ersetzt.</p><br/>


<span class="float-left btn-group bg-dark mr-2"><button class="btn text-light"><span class="fa fa-cogs"></span></button></span>
<p>Im diesem Dialog kann ausgewählt werden, von welcher Fabrik eine Ware hergestellt werden soll, falls es mehrere Möglichkeiten gibt. Standardmäßig ist die <b>Gleiche-Region-Regel</b> eingestellt. Exemplarisch besagt diese, dass das Holz für die Destillerien in der Neuen Welt, das Holz für Nähmaschinen aber in der Alten Welt produziert wird.</p><br/>

<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"><img class="icon-navbar" src="icons/icon_add_goods_socket_white.png" /></button></span>
<p>Zunächst muss festgelegt werden, welche Fabriken mit welchen Items ausgerüstet sind. Dies kann über das Einstellungsmenü (Button rechts oben an jeder Fabrik) geschehen oder über die Zusatzwaren-Itemübersicht, bei der die Fabriken per Checkbox ausgewählt werden können. Den <b>Ertrag der Zusatzwaren</b> wird bei den Fabriken angezeigt, die das Produkt normalerweise herstellen. Zusatzwaren lassen sich durch die Checkbox aus der Berechnung herausnehmen. Dies ist notwendig, wenn mehrere Fabriken dasselbe Produkt herstellen, da andernfalls die Zusatzwaren mehrfach gutgeschrieben würden.</p><br/>

<h5>Inselverwaltung und Handelsrouten</h5>
<div class="input-group mb-2" style=" max-width: 300px; "> <div class="input-group-prepend"> <span class="input-group-text" >Selected Island</span> </div> <select name="islands" class="custom-select" ><option value="">All Islands</option></select> <div class="input-group-append"> <button class="btn btn-secondary" > <span class="fa fa-cog"> </span> </button> </div> </div>
<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"> <img class="icon-navbar" src="icons/icon_map.png"> </button></span>
<p>Als erstes muss über das Zahnrad die <b>Inselverwaltung</b> geöffnet werden. Dort können dann neue Inseln erstellt werden. Wer den <b>Serveranwendung</b> verwendet, erhält dort Vorschläge für Inseln (basieren darauf, welche Inselnamen der Server im Statistikmenü gesehen hat). Mit dem Erstellen der ersten Insel werden in der Mitte der Navigationsleiste neue Bedienelemente angezeigt: Wechseln der Insel, Inselverwaltung öffnen und Handelsroutenmenü öffnen. Neue Inseln bekommen eine <b>Session</b> zugewiesen. Dies beeinflusst, welche Bevölkerungsstufen, Fabriken, Items und Verbrauchseffekte angezeigt werden. Der Button <b>Alles löschen</b> setzt den Warenrechner auf Werkseinstellungen zurück.</p><br/>


<div class="float-left mr-2"> <button class="btn btn-light btn-sm" > <span class="fa fa-sliders"></span> </button> </div>
<p>Das <b>Erstellen von Handelsrouten</b> erfolgt über den <b>Konfigurationsdialog einer Fabrik</b>, die diese Ware normalerweise herstellt. Handelsrouten gibt es in zwei Ausführungen. Zum einen können Waren der <b>Händler eingekauft</b> werden. Durch Auswählen des Kästchens neben dem Händler wird die Route erstellt. Die zweite Möglichkeit ist ein <b>Warentransfer</b> zwischen Inseln. Wie bei Zusatzwaren werden dafür der Bedarf auf der einen Seiter erhöht und auf der anderen erniedrigt. Öffnet man den Dialog, wird die <b>Überproduktion</b> direkt in das Eingabefeld zum Erstellen einer neuen Handelsroute übernommen. Ändern sich Produktion oder Bedarf nachträglich, so werden neben geeigneten Handelsrouten Buttons angezeigt, um die Differenz zu übernehmen. Ein <span class="fa fa-exclamation-triangle " style="color:red"></span> im Eingabefeld weist daraufhin, dass die Quellinsel nicht genug produziert, um die Route vollständig zu bedienen.</p><br/>

<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"> <img data-toggle="modal" data-target="#trade-routes-management-dialog" class="icon-navbar" src="icons/icon_shiptrade.png"> </button></span>
<p>Das Handelsroutenmenü enthält eine Übersicht über alle Handelsrouten, in der Reihenfolge der Erstellung. Dort können Handelsrouten außerdem gelöscht und die Transportmenge angepasst werden.</p><br/>
<span>Es gilt zu beachten, dass <b>Routen an Fabriken gekoppelt</b> sind. Dies bedeutet, dass der Import von derjenigen Fabrik erfolgen muss, von der es auf der anderen Insel produziert wird. Hierfür muss auf der importierenden Insel der Bedarf der richtigen Fabrik zugeordnet werden. Dies lässt sich über </span>
<span class="btn-group bg-dark">
<button class="btn text-light"><span class="fa fa-cogs"></span></button>
</span>
<span> in der Navigationsleiste einstellen. Andernfalls kann es z.B. passieren, dass vorhandene Gebäude bei Kohleminen eingetragen sind, der Bedarf aber bei Köhlereien anfällt. Grundsätzlich lässt sich schwer abbilden, wenn dieselbe Ware von verschiedenen Fabriktypen hergestellt wird. In solchen Fällen ist es empfehlenswert, sich im Warenrechner nur <b>auf einen Fabriktyp zu beschränken</b> und die Produktion der anderen per künstlicher Handelsroute von einer künstlichen Insel zu simulieren.</span><br/>
<br/>

<h5>Speicherstadt</h5>
<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"> <img class="icon-navbar" src="icons/icon_docklands_2d_white.png"> </button></span>
<p>Die Speicherstadt bietet enormes Potential, Waren einzutauschen und sich auf effiziente Produktionen zu beschränken. Jedoch bietet das Spiel nur eingeschränkte Möglichkeiten, um die für den Export notwendigen Produktionskapazitäten zu berechnen. Im Warenrechner werden die Handelsverträge deshalb in t/min angegeben. Der Rechner ermittelt dann, wie viele Tonnen gehandelt werden müssen, um den gewünschten Warenfluss zu erreichen. Das <b>Anlegen eines Vertrags</b> ähnelt dem einer Handelsroute. Im <b>Konfigurationsdialog einer Fabrik</b> werden die Warenmenge und das Tauschprodukt eingestellt. Mittels des Schiebereglers in der Mitte kann eingestellt werden, ob die Ware der ausgewählten Fabrik exportiert oder importiert werden. Wird kein Regler angezeigt, dann kann die Ware nicht importiert werden. <b>Beim Einstellen des Tauschprodukts taucht bei manchen Produkten ein zusätzliches Auswahlfeld auf.</b> Dort muss die Fabrik eingestellt werden, dem die Ware abgezogen bzw. zugeschrieben wird. Bei sämtlichen Auswahlfeldern kann durch Eingeben der Anfangsbuchstaben direkt zum Begriff gesprungen werden. Der Plus-Button erstellt die Route. Anschließend wird die Route in der Export-Fabrik und der Import-Fabrik angezeigt. Außerdem werden alle Verträge im Speicherstadt-Menü angezeigt. Mit einem Klick auf die Produkt-Icons kann zwischen den Menüs gewechselt werden.</p>
<p>Im oberen Bereich des Menüs wird die <b>Export-Pyramide</b> angezeigt und bearbeitet. Hierfür müssen ein Produkt und der Multiplikator ausgewählt und hinzugefügt werden. Zum Umsortieren müssen erst die alten Produkte gelöscht und mit anderen Multiplikatoren neu erstellt werden. Bereits eingestellte Verträge werden dann so angepasst, dass die importierten Tonnen pro Minute gleich bleiben.</p>
<img src="wheel_input.gif" class="float-left" style="margin: 0.5rem 0.5rem 0 0"/>
<p>Im unteren Bereich befindet sich die Übersicht über alle Verträge und zusammenfassende Informationen zum Handel. Hierfür muss als erstes die <b>Ladegeschwindigkeit des Piers</b>, an dem Morris handelt, und seine <p>Reisezeit</p> eingestellt werden (wobei letzteres einen sinnvollen Default-Wert hat). Die Information hierzu kann dem unteren Bereich des Anlegestellen-Infomenüs entnommen werden. Der Rechner ermittelt dann die Umschlagsdauer des Händlers, den Gesamtwarenumschlag in t/min, die benötigte Insellagerkapazität und die einzustellenden Tonnen pro Vertrag. Bei der Berechnung der Werte ist der Ladegeschwindigkeitsbonus des Händlers und die Dauer zum Betreten und Verlassen der Session bereits mit eingerechnet. Sollte dort ∞ stehen, dann übersteigt der eingestellte Warenumschlag den maximal möglichen des Händlers. Dann müssen die Verträge auf mehrere Inseln verteilt, die Ladegeschwindigkeit erhöht oder das Handelsvolumen reduziert werden</p>
<p>Es gibt noch einen weiteren Anwendungsfall, bei dem man pro Handel möglichst viele Waren tauschen möchte. Zuerst müssen dafür die Verträge eingerichtet und die Ladegeschwindigkeit angegeben werden. Die absolute Warenmenge ist dabei unerheblich, es kommt nur auf die relativen Unterschiede zwischen den Verträgen an. Anschließend muss die Insellagerkapazität eingetragen und daneben der Button <b>Setze Gesamtkapazität</b> geklickt werden. Der bestimmt die Ware, welche die meiste Lagerkapazität c benötigt. Der Vertrag wird um einen Faktor f skaliert, sodass c der Insellagerkapazität entspricht. Schließlich werden alle anderen Verträge ebenfalls mit f multipliziert. Ist das Schlosssymbol neben einem Vertrag aktiviert, wird dieser nicht verändert.</p>
<p>Eine Besonderheit ergibt sich bei <b>Allen Inseln</b> (standardmäßig ausgewählt, wenn Inselverwaltung deaktiviert). Dort ist es erlaubt dieselbe Ware <b>zu importieren und exportieren</b>, um so Verträge für mehrere Speicherstädte zusammenfassen zu können. Allerdings werden keine zusammenfassenden Informationen zum Handel angezeigt.</p>
<br/>

<h5>Keim der Hoffnung</h5>
<p>Die <b>Hacienda</b> beeinflusst viele Spielmechaniken und die Konfigurationsmöglichkeiten verteilen sich über den gesamten Warenrechner. Hier eine kurze Übersicht: Die Einwohnerunterkünfte können in der <b>Bevölkerungskonfiguration</b> durch Ausklappen des Abschnitts <b>Wohnhäuser</b> gefunden werden. Die <b>Initiative für maßvolle Ernährung</b> ist im Zeitungsmenü auswählbar. Hacienda-Farmen können im Konfigurationsmenü für Produktionsketten ausgewählt werden. Die <b>Gleiche Region</b>-Option bevorzugt die traditionellen Produktionsgebäude - wenn beide in derselben Region sind. Neue Inseln werden so eingestellt, dass die traditionellen Produktionsgebäude gewählt werden. Vorhandene Inseln aus älteren Konfigurationen des Warenrechners verwenden die gleiche-Region-Regel für alle Produkte, die jetzt neue Produktionsgebäude erhalten haben. Das bedeutet, dass von Obreras verbrauchtes Bier in der Hacienda-Brauerei hergestellt wird.</p>
<p>Die <b>Düngerproduktionskette</b> funktioniert ähnlich wie bei Silos. Jede Farm hat eine zusätzliches Kontrollkästchen, um diese zu aktivieren. Damit werden Produktivität, Zusatzwaren und Düngerverbrauch ausgelöst. Bei Farmen der Alten Welt muss man das Konfigurationsdialog der Fabrik öffnen, um die Option angezeigt zu bekommen. Die Mistproduktion ist allerding besonders. Es gibt keine Standard-Fabrik, welche Mist produziert. Also habe ich eine künstliche erstellt: <b>Alle Tierhöfe</b>. Deren Zweck ist den Überblick über die komplette Mistproduktion zu behalten. Die Produktionsparameter sind von der Mistproduktion einer Alpakafarm abgeleitet. Man könnte also das künstliche Produktionsgebäude direkt verwenden. Der korrekte Weg geht allerdings über <b>Zusatzwaren</b>. Die Mistproduktion wird auf Tierhöfen genauso aktiviert wie man ein Item ausrüsten würde. Der gesammelte Mist wird dann unter Zusatzwaren bei Allen Tierhöfen angezeigt. Danach wird er vom Düngerwerk verarbeitet - übrigens eines der wenigen Produktionsgebäude, bei dem sich das Icon von Ware und Fabrik unterscheiden.</p>
<br/>

<h5>Haftungsausschluss</h5>
<p>Der Warenrechner wird ohne irgendeine Gewährleistung zur Verfügung gestellt. Die Arbeit wurde in KEINER Weise von Ubisoft Blue Byte unterstützt. Alle Assets aus dem Spiel Anno 1800 sind © by Ubisoft.</p><br/>
<p>Darunter fallen insbesondere, aber nicht ausschließlich alle Icons, Bezeichnungen und Verbrauchswerte.</p><br/>

<p>Diese Software steht unter der MIT-Lizenz.</p><br/>

<h5>Autor</h5>
<p>Nico Höllerich</p>
<p>hoellerich.nico@freenet.de</p>
<br/>

<h5>Fehler und Verbesserungen</h5>
<span>Falls Sie auf Fehler oder Unannehmlichkeiten stoßen oder Verbesserungen vorschlagen möchten, erstellen Sie ein Issue auf GitHub (</span><a href="https://github.com/NiHoel/Anno1800Calculator/issues">https://github.com/NiHoel/Anno1800Calculator/issues</a><span>)</span>`,


        english:
            `<h5>Usage and Structure</h5>
<p>Enter the current of residences per level into the topmost row. The production chains will update automatically when one leaves the input field. Only the required factories are displayed.</p>
<p>The letter in square brackets before the resident's name is the <b>hotkey</b> to focus the input field. There, one can use the arrow keys to inc-/decrement the number.</p><br/>
<p>The row below displays the <b>workforce</b> that is required to run all buildings (rounded towards the next complete factory).</p><br/>
<p>Afterwards an <b>overview of the required goods</b> follows. Clicking the heading collapses each section.</p><br/>
<p>Each card displays the name of the product, the icon of the produced good, the number of constructed / required buildings, and the production rate in tons per minute. The number of buildings has, if activated, two decimal places to directly show the amount of overcapacities. The bottom of the tile displays the (required) <b>output of the factory</b> (which are generated in the output storage of the factory plus excess goods).</p>
<p>Since <b>construction materials</b> share intermediate products with consumables they are explicitly listed (unlike in calculators for previous Annos) to better plan the production of mines. The number of factories must be entered manually.</p><br/>

<h5>Population Configuration</h5>
<p>The button top left of the population levels opens a dedicated menu. The residents are automatically calculated based on the number of residences, consumption effects and supplied needs.</p>
<p>The needs grouped by category are below the residents. The checkbox next to the good (un-)lock the need. Clicking the checkbox next to the heading (un-)checks the whole category. The marketplace icon opens the production chain overview.</p><br/>

<h5>Global Settings</h5>
<span class="btn-group bg-dark mr-2 float-left">
<button class="btn text-light"><span class="fa fa-adjust"> </span></button>
<button class="btn text-light"><span class="fa fa-cog"> </span></button>
<button class="btn text-light"><span class="fa fa-question-circle-o"> </span></button>
<button class="btn text-light"><span class="fa fa-download"> </span></button>
</span>
<p>The buttons on the right of the navigation bar serve the purpose of managing the calculator. They toggle dark mode, open settings, show the help or open the download dialog. The language and the amount of displayed information can be adjusted in the settings. In the <b>download area</b> one can import and export the <b>configuration</b> (settings, islands, productivity, buildings, ...). Moreover, this calculator can be downloaded.</p><br/>

<h5>Good Configuration Dialog</h5>
<p>The button top left of the factory opens a more detailled menu. There, items, buildings, productivity, modules, effects and water supply can be applied or entered. It only lists items which change productivity, input goods or workforce and provide extra goods. Items that fall in neither of the three categories are not included for clarity. Apart from that, trade routes and traders are created in this dialog. The button <b>Obtain goods from</b> makes the factory produce that good, or imports the good from the selected island or neutral trader (depending on which one you click)</p><br/>


<h5>Consumption Effects, Production Chains, and Extra Goods Items</h5>
<span class="btn-group bg-dark mr-2 float-left">
    <button type="button" class="btn">
        <img data-toggle="modal" data-target="#effects-dialog" class="icon-navbar" src="./icons/icon_add_goods_socket_white.png" />
    </button>
    <button type="button" class="btn">
        <img data-toggle="modal" data-target="#patron-selection-dialog" class="icon-navbar" src="./icons/icon_2d_religion_belief_0.webp" />
    </button>
</span>
<p>The buttons are found in the left of the navigation bar.</p><br/>

<span class="btn-group bg-dark mr-2 float-left"><button type="button" class="btn"><img data-toggle="modal" data-target="#good-consumption-island-upgrade-dialog" class="icon-navbar" src="icons/icon_newspaper.png" /></button></span>
<p>The effect dialog lets you apply researched technologies (globally), Exalted Patron Effect (globally), events (per session or island), and Exalted Patron Effect (per island).</p><br/>

<span class="float-left btn-group bg-dark mr-2"><button class="btn text-light"><span src="./icons/icon_2d_religion_belief_0.webp"></span></button></span>
<p>The patron selection dialog lets you apply the patron and enter the devotion. It displays the buff and affected factories.</p><br/>

<h5>Island and Trade Route Management</h5>
<div class="input-group mb-2" style=" max-width: 300px; "> <div class="input-group-prepend"> <span class="input-group-text" >Selected Island</span> </div> <select name="islands" class="custom-select" ><option value="">All Islands</option></select> <div class="input-group-append"> <button class="btn btn-secondary" > <span class="fa fa-cog"> </span> </button> </div> </div>
<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"> <img class="icon-navbar" src="icons/icon_map.png"> </button></span>
<p>First, one must open the <b>island management dialog</b> by clicking the cogwheel. One can create new islands there. After creating the first island three new control elements show up in the center of the navigation bar: Switch island, open island management, and open trade route management. New islands are associated with a <b>session</b>. The session influences which population levels, factories, items and good consumption effects show up. The button <b>Delete All</b> resets the calculator to its initial state.</p><br/>

<div class="float-left mr-2"> <button class="btn btn-light btn-sm" > <span class="fa fa-sliders"></span> </button> </div>
<p><b>Trade routes are created</b> from the <b>product configuration dialog</b>. There are two kinds of trade routes. The first kind are routes to <b>purchase goods passively from traders</b>. Clicking the <b>obtain goods from</b> button purchases the demand for this product from traders. The second kind are routes to <b>transfer goods between islands</b>. Like for extra goods, the extra demand is increased on one side and decreased on the other. When opening the factory configuration dialog, the calculator enters the <b>overproduction</b> into the amount input field for a new trade route. When production or island demand change, buttons show up next to suitable trade routes that allow to add the difference. A <span class="fa fa-exclamation-triangle " style="color:red"></span> on an input field signals that the source island does not produce enough to fully supply the trade route.</p><br/>

<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"> <img data-toggle="modal" data-target="#trade-routes-management-dialog" class="icon-navbar" src="icons/icon_shiptrade.png"> </button></span>
<p>The trade route menu contains an overview of all trade routes, listed in the order of creation. One can delete trade routes and adjust their load there.</p><br/>
<br/>

<h5>Disclaimer</h5>
<p>The calculator is provided without warranty of any kind. The work was NOT endorsed by Ubisoft Mainz in any kind. All the assets from Anno 117 game are © by Ubisoft.</p><br/>
<p>These are especially but not exclusively all icons, designators, and consumption values.</p><br/>

<p>This software is under the MIT license.</p><br/>

<h5>Author</h5>
<p>Nico Höllerich</p>
<p>hoellerich.nico@freenet.de</p><br/>

<h5>Bugs and improvements</h5>
<span>If you encounter any bugs or inconveniences or if you want to suggest improvements, create an Issue on GitHub (</span><a href="https://github.com/NiHoel/Anno1800Calculator/issues">https://github.com/NiHoel/Anno1800Calculator/issues</a><span>)</span>`
    }
};



export const options: Record<string, any> = {
    "decimalsForBuildings": {
        "name": "Show number of buildings with decimals",
        "locaText": {
            "english": "Show number of buildings with decimals",
            "french": "Afficher le nombre de bâtiments avec des décimales",
            "polish": "Pokaż liczbę budynków z dziesiątnymi",
            "spanish": "Mostrar el número de edificios con decimales",
            "italian": "Mostra il numero di edifici con decimali",
            "german": "Zeige Nachkommastellen bei der Gebäudeanzahl",
            "brazilian": "Mostrar número de edifícios com decimais",
            "russian": "Показать количество зданий с десятичными знаками",
            "simplified_chinese": "建筑数量显示为小数模式",
            "traditional_chinese": "建築數量顯示為小數模式",
            "japanese": "建物の数を小数点付きで表示",
            "korean": "건물 수를 소수점 단위로 표시"
        }
    },
    "hideNames": {
        "name": "Hide the names of products, factories, and population levels",
        "locaText": {
            "english": "Hide the names of products, factories, and population levels",
            "french": "Masquer les noms des produits, usines et niveaux de population",
            "polish": "Ukryj nazwy produktów, fabryk i poziomów populacji",
            "spanish": "Ocultar los nombres de productos, fábricas y niveles de población",
            "italian": "Nascondi i nomi di prodotti, fabbriche e livelli di popolazione",
            "german": "Verberge die Namen von Produkten, Fabriken und Bevölkerungsstufen",
            "brazilian": "Ocultar os nomes de produtos, fábricas e níveis de população",
            "russian": "Скрыть названия товаров, фабрик и уровней населения",
            "simplified_chinese": "隐藏产品、工厂和人口等级的名称",
            "traditional_chinese": "隱藏產品、工廠和人口等級的名稱",
            "japanese": "製品、工場、人口レベルの名前を非表示",
            "korean": "제품, 건물명 및 인구 이름 숨기기"
        }
    },
    /*
    "hideProductionBoost": {
        "name": "Hide the input fields for productivity",
        "locaText": {
            "english": "Hide the input fields for producivity",
            "french": "Masquer les champs de saisie pour la productivité",
            "polish": "Ukryj pola wejściowe dla produktywności",
            "spanish": "Ocultar los campos de entrada para la productividad",
            "italian": "Nascondi i campi di input per la produttività",
            "german": "Verberge das Eingabefelder für Produktivität",
            "brazilian": "Ocultar os campos de entrada para produtividade",
            "russian": "Скрыть поля ввода для производительности",
            "simplified_chinese": "隐藏生产力输入字段",
            "traditional_chinese": "隱藏生產力輸入字段",
            "japanese": "生産性の入力フィールドを非表示",
            "korean": "생산성 입력 필드 숨기기"
        }
    },
    */
    "showAllProducts": {
        "name": "Show all products available in the region",
        "locaText": {
            "english": "Show all products available in the region",
            "french": "Afficher tous les produits disponibles dans la région",
            "polish": "Pokaż wszystkie produkty dostępne w regionie",
            "spanish": "Mostrar todos los productos disponibles en la región",
            "italian": "Mostra tutti i prodotti disponibili nella regione",
            "german": "Zeige alle in der Region verfügbaren Produkte",
            "brazilian": "Mostrar todos os produtos disponíveis na região",
            "russian": "Показать все продукты, доступные в регионе",
            "simplified_chinese": "显示该地区所有可用的产品",
            "traditional_chinese": "顯示該地區所有可用的產品",
            "japanese": "地域で利用可能なすべての製品を表示",
            "korean": "지역에서 사용 가능한 모든 제품 표시"
        }
    },
    "missingBuildingsHighlight": {
        "name": "Highlight missing buildings",
        "locaText": {
            "english": "Highlight missing buildings",
            "french": "Mettre en évidence les bâtiments manquants",
            "polish": "Podświetl brakujące budynki",
            "spanish": "Resaltar edificios faltantes",
            "italian": "Evidenzia edifici mancanti",
            "german": "Fehlende Gebäude hervorheben",
            "brazilian": "Destacar edifícios faltantes",
            "russian": "Выделить недостающие здания",
            "simplified_chinese": "高亮缺失的建筑",
            "traditional_chinese": "高亮缺失的建築",
            "japanese": "不足している建物を強調表示",
            "korean": "부족한 건물 강조"
        }
    },

    // "needUnlockConditions": {
    //     "name": "Consider unlock conditions for needs",
    //     "locaText": {
    //         "english": "Consider unlock conditions for needs",
    //         "german": "Freischaltbedingungen der Bedürfnisse berücksichtigen",
    //     }
    // },
};

