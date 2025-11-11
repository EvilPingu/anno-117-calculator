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
    showIslandOnCreation: {
        english: "After creating a new island display it",
        french: "Afficher la nouvelle île après sa création",
        polish: "Po utworzeniu nowej wyspy ją wyświetl",
        spanish: "Mostrar la isla después de crearla",
        italian: "Visualizza la nuova isola dopo la creazione",
        german: "Nach dem Erstellen einer neuen Insel diese anzeigen",
        brazilian: "Exibir a ilha após criá-la",
        russian: "Показать остров после создания",
        simplified_chinese: "创建新岛屿后显示它",
        traditional_chinese: "建立新島嶼後顯示它",
        japanese: "新しい島を作成した後に表示する",
        korean: "새 섬 생성 후 표시"
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
        english: "Game Update 17",
        french: "Mise à jour du jeu 17",
        polish: "Aktualizacja gry 17",
        spanish: "Actualización del juego 17",
        italian: "Aggiornamento del gioco 17",
        german: "Game Update 17",
        brazilian: "Atualização do jogo 17",
        russian: "Обновление игры 17",
        simplified_chinese: "游戏更新 17",
        traditional_chinese: "遊戲更新 17",
        japanese: "ゲームアップデート 17",
        korean: "게임 업데이트 17"
    },
    helpContent: {
        german:
            `<h5>Verwendung und Aufbau</h5>
<p>Trage die aktuellen oder angestrebten Einwohner pro Stufe in die oberste Reihe ein. Die Produktionsketten aktualisieren sich automatisch, sobald man die Eingabe verlässt. Es werden nur diejenigen Fabriken angezeigt, die benötigt werden.</p>
<p>Der Buchstabe in eckigen Klammern vor dem Bevölkerungsnamen ist der <b>Hotkey</b> zum Fokussieren des Eingabefeldes. Die Anzahl dort kann ebenfalls durch Drücken der Pfeiltasten erhöht und verringert werden.</p><br/>
<p>In der darunterliegenden Reihe wird die <b>Arbeitskraft</b> angezeigt, die benötigt wird, um alle Gebäude zu betreiben (jeweils auf die nächste ganze Fabrik gerundet).</p><br/>
<p>Danach folgt ein <b>Überblick über alle benötigten Gebäude</b>, sortiert nach dem produzierten Warentyp. Jeder der Abschnitte kann durch einen Klick auf die Überschrift zusammengeklappt werden.</p><br/>
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


<div class="ui-fchain-item" style="width: 100%"> <div class="mb-3 inline-list-stretched" > <div class="custom-control custom-checkbox"> <input type="checkbox" class="custom-control-input" > <label class="custom-control-label" src-only="" style="vertical-align: top;" for="45-npcRoute-checked"> <img class="icon-sm" src="data:image/png;base64,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" > <span >Sir Archibald Blake</span> </label> </div> <div> <span >7</span> <span> t/min</span> </div> <div class="custom-control custom-checkbox"> <input type="checkbox" class="custom-control-input" > <label class="custom-control-label" src-only="" style="vertical-align: top;" for="77-npcRoute-checked"> <img class="icon-sm" src="data:image/png;base64,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" > <span >Old Nate</span> </label> </div> <div> <span >5</span> <span> t/min</span> </div> </div><table class="table table-striped table-sm" > <tbody ></tbody> </table> <form class="form form-inline" style="justify-content: space-between"> <select name="islands" class="custom-select" ><option value="">The Old World - Goldfurth</option></select> <div style="display: flex"> <div class="mr-2"> <img class="icon-sm icon-light" src="icons/icon_transporter_loading_light.png"> </div> <div class="custom-control custom-switch"> <input type="checkbox" class="custom-control-input" > <label class="custom-control-label" for="create-trade-route-export-checkbox"> <img class="icon-sm icon-light" src="icons/icon_transporter_unloading_light.png"> </label> </div> </div> <div class="input-group input-group-short spinner"> <input step="0.1" class="form-control" type="number" value="0" > <div class="input-group-append"> <span class="input-group-text">t/min</span> </div> </div> <button class="btn btn-sm btn-light" disabled=""> <span class="fa fa-plus"></span> </button> </form> </div>

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

        simplified_chinese:
            `<h5>使用方法</h5>
<p>第一行输入每个阶级当前或所需的人口数。当离开输入字段时，生产链将自动更新。仅显示所需的工厂。</p>
<p>居民姓名前的方括号内的字母是聚焦输入字段的快捷键。可以使用上下箭头键来增减数字。</p><br/>
<p>第二行：所需劳动力，显示了运行所有建筑物所需的劳动力</p><br/>
<p>接下来是每个产品需要的工厂数量。单击标题会折叠每个部分。</p><br/>
<p>每张卡片都显示工厂名称、产品图标、生产效率、所需工厂数量以及每分钟产量(吨)。红色高亮时，卡片下方有两位小数，显示每分钟的消耗量。the the  The number The bottom of the tile displays the (required) <b>output of the factory</b> (which are generated in the output storage of the factory plus extra goods).</p>
<p>The public buildings section lists all public services that consume goods. For the mail in the Empire of the Skies DLC, not the number of post offices required but the amount of population that needs to be within range of a post office is displayed. The recipe mechanic from the tourist season DLC is implemented as follows. Each recipe is a dedicated building. To add a recipe for the first time, select it from the dropdown and click the plus button. A new tile appears that behaves like a normal production building. The only difference is that by setting it to zero, the tile disappears and the recipe is re-added to the list.</p><br/>
<p>Since <b>construction materials</b> share intermediate products with consumables they are explicitly listed (unlike in calculators for previous Annos) to better plan the production of mines. The number of factories must be entered manually.</p><br/>

<h5>人口配置</h5>
<p>每种人口右上角的按钮可打开专用菜单。人口数是根据住宅数量、需求满足情况自动计算的，通常与游戏内显示的数量不匹配（例如，游戏中居民搬入是需要时间的）。如果直接改动人口数，每栋居民楼都会补满人数。因此，输入的人数会自动改变。</p>
<p>When clicking on the heading <b>Skyscrapers</b>, or <b>Residences</b> respectively, the skyscraper levels, or <b>Hacienda Quaters</b> are shown. Each row shows the number of buildings, the total residents per residence type, and the consumption effects. The tooltip of the consumption effects displays the coverage. Except for the skyscraper maintenance in the finance screen, the game provides no help to estimate these values. The upper input fields become summary fields once the first skyscraper is built and can no longer be modified.</p><br/>
<p>人口数下方是按类型分组的需求。通过勾选来解锁/锁定需求。单击需求分组旁边的复选框可解锁/选中所有需求。右侧的市场图标打开消费效果的配置对话框. Depending on which button is clicked different filters are applied. The one next to needs only shows effects that affect that need and its the production chain. The button <b>Apply Globally</b> copies consumption effects and locked needs to all other islands.</p><br/>

<h5>全局设置</h5>
<span class="btn-group bg-dark mr-2 float-left">
<button class="btn text-light"><span class="fa fa-adjust"> </span></button>
<button class="btn text-light"><span class="fa fa-cog"> </span></button>
<button class="btn text-light"><span class="fa fa-question-circle-o"> </span></button>
<button class="btn text-light"><span class="fa fa-download"> </span></button>
</span>
<p>网页右上角的按钮用于配置计算器。切换夜间模式、打开设置、显示帮助或打开下载对话框。可以在设置中调整语言和数字显示格式。在下载弹窗中，可以导入和导出配置（设置、岛屿、生产力、建筑物……）。此外，可以下载该计算器和附加服务器应用程序。<b>服务器应用程序</b>自动从游戏中读取已构建的建筑物、岛屿和生产力。</p><br/>

<h5>工厂配置对话框</h5>
<p>工厂右上角的按钮可打开更详细的菜单。可以配置增益物品、工厂数、生产效率、modules, effects and clipping。It only lists items which change input goods or workforce and provide extra goods.Items that fall in neither of the three categories are not included for clarity. 例如，需要在没有增益的情况下计算生产效率。 还有，贸易路线和合同都是在此对话框中创建的。</p><br/>


<h5>消费效果、生产链和Extra Goods Items</h5>
<span class="btn-group bg-dark mr-2 float-left">
<button type="button" class="btn"><img data-toggle="modal" data-target="#good-consumption-island-upgrade-dialog" class="icon-navbar" src="icons/icon_newspaper.png" /></button>
<button class="btn text-light"><span class="fa fa-cogs"></span></button>
<button type="button" class="btn"><img data-toggle="modal" data-target="#effects-dialog" class="icon-navbar" src="icons/icon_add_goods_socket_white.png" /></button>
</span>
<p>这些图标在网页左上角</p><br/>

<span class="btn-group bg-dark mr-2 float-left"><button type="button" class="btn"><img data-toggle="modal" data-target="#good-consumption-island-upgrade-dialog" class="icon-navbar" src="icons/icon_newspaper.png" /></button></span>
<p>Apart from the <b>newspaper</b> other effects can be applied that <b>change the good consumption</b>, e.g. zoo sets, palace effects, items, and public building effects from the <b>tourist season DLC</b>. While effects and items are activated per island, the newspaper is global. To simplify the configuration of multiple islands, the button <b>Apply globally</b> copies all consumption effects to all other islands und replaces existing ones.</p><br/>

<span class="float-left btn-group bg-dark mr-2"><button class="btn text-light"><span class="fa fa-cogs"></span></button></span>
<p>In this dialog one can choose which product should be produced by which factory, in case several factories produce the same product. By default, the <b>same region policy</b> is selected. By example, this means that the wood for distilleries is produced in the New World while the wood for sewing machines is produced in the Old World.</p><br/>

<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"><img class="icon-navbar" src="icons/icon_add_goods_socket_white.png" /></button></span>
<p>First, one must select with which items a factory is equipped. One can do this from the factory configuration dialog (button on the top right of the factory tile) or from the extra goods item overview, where each checkbox represents a factory. A factory that would normally produce this product shows the <b>gained extra goods</b>. Extra goods can be excluded from calculation by unchecking the checkbox. This is necessary in case several factories produce the same good. Otherwise the gained extra goods would be added multiple times.</p><br/>

<h5>Inselverwaltung und Handelsrouten</h5>
<div class="input-group mb-2" style=" max-width: 300px; "> <div class="input-group-prepend"> <span class="input-group-text" >Selected Island</span> </div> <select name="islands" class="custom-select" ><option value="">All Islands</option></select> <div class="input-group-append"> <button class="btn btn-secondary" > <span class="fa fa-cog"> </span> </button> </div> </div>
<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"> <img class="icon-navbar" src="icons/icon_map.png"> </button></span>
<p>First, one must open the <b>island management dialog</b> by clicking the cogwheel. One can create new islands there. When using the <b>server application</b> suggestions for new islands get listed (based on those island names the server has seen on the statistics screen). After creating the first island three new control elements show up in the center of the navigation bar: Switch island, open island management, and open trade route management. New islands are associated with a <b>session</b>. The session influences which population levels, factories, items and good consumption effects show up. The button <b>Delete All</b> resets the calculator to its initial state.</p><br/>

<div class="ui-fchain-item" style="width: 100%"> <div class="mb-3 inline-list-stretched" > <div class="custom-control custom-checkbox"> <input type="checkbox" class="custom-control-input" > <label class="custom-control-label" src-only="" style="vertical-align: top;" for="45-npcRoute-checked"> <img class="icon-sm" src="data:image/png;base64,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" > <span >Sir Archibald Blake</span> </label> </div> <div> <span >7</span> <span> t/min</span> </div> <div class="custom-control custom-checkbox"> <input type="checkbox" class="custom-control-input" > <label class="custom-control-label" src-only="" style="vertical-align: top;" for="77-npcRoute-checked"> <img class="icon-sm" src="data:image/png;base64,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" > <span >Old Nate</span> </label> </div> <div> <span >5</span> <span> t/min</span> </div> </div><table class="table table-striped table-sm" > <tbody ></tbody> </table> <form class="form form-inline" style="justify-content: space-between"> <select name="islands" class="custom-select" ><option value="">The Old World - Goldfurth</option></select> <div style="display: flex"> <div class="mr-2"> <img class="icon-sm icon-light" src="icons/icon_transporter_loading_light.png"> </div> <div class="custom-control custom-switch"> <input type="checkbox" class="custom-control-input" > <label class="custom-control-label" for="create-trade-route-export-checkbox"> <img class="icon-sm icon-light" src="icons/icon_transporter_unloading_light.png"> </label> </div> </div> <div class="input-group input-group-short spinner"> <input step="0.1" class="form-control" type="number" value="0" > <div class="input-group-append"> <span class="input-group-text">t/min</span> </div> </div> <button class="btn btn-sm btn-light" disabled=""> <span class="fa fa-plus"></span> </button> </form> </div>

<div class="float-left mr-2"> <button class="btn btn-light btn-sm" > <span class="fa fa-sliders"></span> </button> </div>
<p><b>Trade routes are created</b> from the <b>factory configuration dialog</b> of a factory that normally produces this product. There are two kinds of trade routes. The first kind are routes to <b>purchase goods from a trader</b>. Selecting the checkbox next to the trader creates such a route. The second kind are routes to <b>transfer goods between islands</b>. Like for extra goods, the extra demand is increased on one side and decreased on the other. When opening the factory configuration dialog, the calculator enters the <b>overproduction</b> into the amount input field for a new trade route. When production or island demand change, buttons show up next to suitable trade routes that allow to add the difference. A <span class="fa fa-exclamation-triangle " style="color:red"></span> on an input field signals that the source island does not produce enough to fully supply the trade route.</p><br/>

<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"> <img data-toggle="modal" data-target="#trade-routes-management-dialog" class="icon-navbar" src="icons/icon_shiptrade.png"> </button></span>
<p>The trade route menu contains an overview of all trade routes, listed in the order of creation. One can delete trade routes and adjust their load there.</p><br/>
<span>Please note that <b>routes are attached to factories</b>. This means that an import must be configured on the factory that produces the good on the source island. The demand must therefore be associated with the correct factory on the importing island. The settings can be changed via </span>
<span class="btn-group bg-dark">
<button class="btn text-light"><span class="fa fa-cogs"></span></button>
</span>
<span> in the navigation bar. Otherwise it may happen that for instance existing coal mines produce sufficient goods, but the demand is associated with charcoal kilns. It is not possible to produce one input good for one factory by different other factories. One must <b>stick with one type of factory</b> and simulate the production of other factories by artificial trade routes from artificial islands.</span><br/>
<br/>

<h5>Docklands</h5>
<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"> <img class="icon-navbar" src="icons/icon_docklands_2d_white.png"> </button></span>
<p>Docklands offers an enormous potential to trade goods and to focus on efficient production chains. But the game provides limited information to compute the required production capacities required for the export. Therefore, trade contracts in the calculator are based on t/min. The calculator computes the amount in tons that must be entered into the in-game contract to achieve the desired flow of goods. <b>Creating a contract</b> is like creating a trade route. One configures the number of goods and the exchange product in the <b>factory configuration dialog</b>. The switch in the middle toggles between exporting and importing the product of the selected factory. If no switch is shown, the good cannot be imported. <b>When selecting particular exchange products, an additional selection box appears.</b> There, one has to choose the factory where the good is added or subtracted. In every selection box, one can directly jump to the term by typing the first letters. The plus button creates a route. Afterwards, the route is shown at the import and export factory. The docklands dialog shows an overview of all contracts for one island. One can switch between the dialogs by clicking on the product icons.</p>
<p>The upper part of the dialog shows the <b>export pyramid</b>. New entries are added by selecting a product and a multiplier. Rearranging the pyramid is achieved by deleting and recreating the entries. Existing contracts are updated such that the imported tons per minute remain the same.</p>
<img src="wheel_input.gif" class="float-left" style="margin: 0.5rem 0.5rem 0 0"/>
<p>The lower part of the dialog shows an overview of all contracts and summary information about the trade. First of all, one has to enter the <b>loading speed of the pier</b> where Tobias trades and his <b>travel time</b> (where the latter has a sensible default value). The loading speed is displayed in the lower part of the pier's information panel in the game. The calculator computes the trading duration, the total stock turnover in t/min, the island's required storage capacity, and the tons one must enter for each contract. The calculation of these values includes the loading speed bonus for Tobias and the duration to enter and leave the session. In case ∞ is displayed, the entered stock turnover exceeds the maximum. Then, one must distribute the contracts over more islands, increase the loading speed or reduce the traded volume.</p>
<p>There is a second use case, where one wants to trade as many goods as possible per trade. First of all, one has to specify all the trade contracts and the loading speed. Here, the absolute amount per contract does not matter, only the relative difference between different contracts. Then, enter the total island storage capacity and click the button <b>Set total capacity</b> next to it. It determines the good that requires the maximal storage capacity c. It scales the contract by a factor f such that c matches the island storage capacity. Finally, f is applied to all other contracts. If the lock symbol next to a contract is clicked, it is not modified.</p>
<p><b>All Islands</b> (selected by default, if no island management is active) behaves a bit different. It allows to <b>import and export</b> the same good so that one can aggregate the contracts of several docklands. But it does not show the summary information about the trade.</p>
<br/>

<h5>Seeds of Change</h5>
<p>The <b>Hacienda</b> affects many game mechanics and configuration options are scattered across the calculator. Here is a short overview: The resident quarters can be found in the <b>population configuration</b> menu by expanding the <b>Residences</b> dropdown. The <b>Dietary Education Initiative</b> is available in the newspaper dialog. Hacienda farms can be selected in the production chain configuration menu. The <b>same region</b> option favors the traditional production buildings - if both are in the same region. New islands will be configured to use the traditional ones. Existing islands from older configurations use the same region option for all products that now have new production buildings. This means that beer consumed by Obreras is assumed to be produced by Hacienda Brewery.</p>
<p>The <b>fertiliser chain</b> works like silos. Each farm has an extra checkbox to enable it. This will induce productivity increase, extra goods, and fertiliser consumption. For old world farms, one has to open the factory configuration dialog to see this checkbox. Dung production is special, however. There is no standard factory in the game to produce it, so I created an artificial one: <b>All Animal Farms</b>. Its purpose is to keep track of all produced dung. The production statistics are derived from the dung production of an alpaca farm. So, one can use this artificial production building directly. The correct way, however, is via <b>extra goods</b>. The dung production on an animal farm is enabled like you would equip an item. The collected dung is shown in the extra goods section of the All Animal Farms and then processed by the Fertilizer Works - which is one of the few factories where product and factory icon differ.</p> 
<br/>

<h5>免责声明</h5>
<p>计算器不提供任何形式的保证。该作品未得到育碧 Blue Byte 任何形式的认可。 《纪元 1800》游戏的所有资产均由 Ubisoft © 拥有。</p><br/>
<p>包括但不限于所有图标、指示符和数值设计。</p><br/>

<p>该软件受 MIT 许可。</p><br/>

<h5>作者</h5>
<p>Nico Höllerich</p>
<p>hoellerich.nico@freenet.de</p>
<br/>

<h5>错误和改进</h5>
<span>如果您遇到任何错误或不便，或者想要提出改进建议，请在 GitHub 上创建Issue (</span><a href="https://github.com/NiHoel/Anno1800Calculator/issues">https://github.com/NiHoel/Anno1800Calculator/issues</a><span>)</span>`,

        english:
            `<h5>Usage and Structure</h5>
<p>Enter the current or desired number of residents per level into the topmost row. The production chains will update automatically when one leaves the input field. Only the required factories are displayed.</p>
<p>The letter in square brackets before the resident's name is the <b>hotkey</b> to focus the input field. There, one can use the arrow keys to inc-/decrement the number.</p><br/>
<p>The row below displays the <b>workforce</b> that is required to run all buildings (rounded towards the next complete factory).</p><br/>
<p>Afterwards an <b>overview of the required buildings</b> sorted by the produced good follows. Clicking the heading collapses each section.</p><br/>
<p>Each card displays the name of the factory, the icon of the produced good, the productivity, the number of required buildings, and the production rate in tons per minute. The number of buildings has, if activated, two decimal places to directly show the amount of overcapacities. The bottom of the tile displays the (required) <b>output of the factory</b> (which are generated in the output storage of the factory plus extra goods).</p>
<p>The public buildings section lists all public services that consume goods. For the mail in the Empire of the Skies DLC, not the number of post offices required but the amount of population that needs to be within range of a post office is displayed. The recipe mechanic from the tourist season DLC is implemented as follows. Each recipe is a dedicated building. To add a recipe for the first time, select it from the dropdown and click the plus button. A new tile appears that behaves like a normal production building. The only difference is that by setting it to zero, the tile disappears and the recipe is re-added to the list.</p><br/>
<p>Since <b>construction materials</b> share intermediate products with consumables they are explicitly listed (unlike in calculators for previous Annos) to better plan the production of mines. The number of factories must be entered manually.</p><br/>

<h5>Population Configuration</h5>
<p>The button top left of the population levels opens a dedicated menu. The residents are automatically calculated based on the number of residences, consumption effects and supplied needs und will normally not match the numbers in Anno (e.g. because residents still need to move in). If you change the residents, the number of buildings is estimated to reach the specified residents. Accordingly, the input field will show a slightly different value than entered.</p>
<p>When clicking on the heading <b>Skyscrapers</b>, or <b>Residences</b> respectively, the skyscraper levels, or <b>Hacienda Quaters</b> are shown. Each row shows the number of buildings, the total residents per residence type, and the consumption effects. The tooltip of the consumption effects displays the coverage. Except for the skyscraper maintenance in the finance screen, the game provides no help to estimate these values. The upper input fields become summary fields once the first skyscraper is built and can no longer be modified.</p><br/>
<p>The needs grouped by type are below the residents. The checkbox next to the good (un-)lock the need. Clicking the checkbox next to the heading (un-)checks all needs. The marketplace icon opens the <b>configuration dialog for consumption effects</b>. Depending on which button is clicked different filters are applied. The one next to needs only shows effects that affect that need and its the production chain. The button <b>Apply Globally</b> copies consumption effects and locked needs to all other islands.</p><br/>

<h5>Global Settings</h5>
<span class="btn-group bg-dark mr-2 float-left">
<button class="btn text-light"><span class="fa fa-adjust"> </span></button>
<button class="btn text-light"><span class="fa fa-cog"> </span></button>
<button class="btn text-light"><span class="fa fa-question-circle-o"> </span></button>
<button class="btn text-light"><span class="fa fa-download"> </span></button>
</span>
<p>The buttons on the right of the navigation bar serve the purpose of managing the calculator. They toggle dark mode, open settings, show the help or open the download dialog. The language and the amount of displayed information can be adjusted in the settings. In the <b>download area</b> one can import and export the <b>configuration</b> (settings, islands, productivity, buildings, ...). Moreover, this calculator and an additional server application can be downloaded. The <b>server application</b> reads constructed buildings, islands, and productivity automatically from the game.</p><br/>

<h5>Factory Configuration Dialog</h5>
<p>The button top left of the factory opens a more detailled menu. There, items, buildings, productivity, modules, effects and clipping can be applied or entered. It only lists items which change input goods or workforce and provide extra goods. Items that fall in neither of the three categories are not included for clarity. E.g. the <b>productivity</b> needs to be calculated and entered without any support. Apart from that, trade routes and contractes are created in this dialog.</p><br/>


<h5>Consumption Effects, Production Chains, and Extra Goods Items</h5>
<span class="btn-group bg-dark mr-2 float-left">
<button type="button" class="btn"><img data-toggle="modal" data-target="#good-consumption-island-upgrade-dialog" class="icon-navbar" src="icons/icon_newspaper.png" /></button>
<button class="btn text-light"><span class="fa fa-cogs"></span></button>
<button type="button" class="btn"><img data-toggle="modal" data-target="#effects-dialog" class="icon-navbar" src="icons/icon_add_goods_socket_white.png" /></button>
</span>
<p>The buttons are found in the left of the navigation bar.</p><br/>

<span class="btn-group bg-dark mr-2 float-left"><button type="button" class="btn"><img data-toggle="modal" data-target="#good-consumption-island-upgrade-dialog" class="icon-navbar" src="icons/icon_newspaper.png" /></button></span>
<p>Apart from the <b>newspaper</b> other effects can be applied that <b>change the good consumption</b>, e.g. zoo sets, palace effects, items, and public building effects from the <b>tourist season DLC</b>. While effects and items are activated per island, the newspaper is global. To simplify the configuration of multiple islands, the button <b>Apply globally</b> copies all consumption effects to all other islands und replaces existing ones.</p><br/>

<span class="float-left btn-group bg-dark mr-2"><button class="btn text-light"><span class="fa fa-cogs"></span></button></span>
<p>In this dialog one can choose which product should be produced by which factory, in case several factories produce the same product. By default, the <b>same region policy</b> is selected. By example, this means that the wood for distilleries is produced in the New World while the wood for sewing machines is produced in the Old World.</p><br/>

<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"><img class="icon-navbar" src="icons/icon_add_goods_socket_white.png" /></button></span>
<p>First, one must select with which items a factory is equipped. One can do this from the factory configuration dialog (button on the top right of the factory tile) or from the extra goods item overview, where each checkbox represents a factory. A factory that would normally produce this product shows the <b>gained extra goods</b>. Extra goods can be excluded from calculation by unchecking the checkbox. This is necessary in case several factories produce the same good. Otherwise the gained extra goods would be added multiple times.</p><br/>

<h5>Island and Trade Route Management</h5>
<div class="input-group mb-2" style=" max-width: 300px; "> <div class="input-group-prepend"> <span class="input-group-text" >Selected Island</span> </div> <select name="islands" class="custom-select" ><option value="">All Islands</option></select> <div class="input-group-append"> <button class="btn btn-secondary" > <span class="fa fa-cog"> </span> </button> </div> </div>
<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"> <img class="icon-navbar" src="icons/icon_map.png"> </button></span>
<p>First, one must open the <b>island management dialog</b> by clicking the cogwheel. One can create new islands there. When using the <b>server application</b> suggestions for new islands get listed (based on those island names the server has seen on the statistics screen). After creating the first island three new control elements show up in the center of the navigation bar: Switch island, open island management, and open trade route management. New islands are associated with a <b>session</b>. The session influences which population levels, factories, items and good consumption effects show up. The button <b>Delete All</b> resets the calculator to its initial state.</p><br/>

<div class="ui-fchain-item" style="width: 100%"> <div class="mb-3 inline-list-stretched" > <div class="custom-control custom-checkbox"> <input type="checkbox" class="custom-control-input" > <label class="custom-control-label" src-only="" style="vertical-align: top;" for="45-npcRoute-checked"> <img class="icon-sm" src="data:image/png;base64,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" > <span >Sir Archibald Blake</span> </label> </div> <div> <span >7</span> <span> t/min</span> </div> <div class="custom-control custom-checkbox"> <input type="checkbox" class="custom-control-input" > <label class="custom-control-label" src-only="" style="vertical-align: top;" for="77-npcRoute-checked"> <img class="icon-sm" src="data:image/png;base64,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" > <span >Old Nate</span> </label> </div> <div> <span >5</span> <span> t/min</span> </div> </div><table class="table table-striped table-sm" > <tbody ></tbody> </table> <form class="form form-inline" style="justify-content: space-between"> <select name="islands" class="custom-select" ><option value="">The Old World - Goldfurth</option></select> <div style="display: flex"> <div class="mr-2"> <img class="icon-sm icon-light" src="icons/icon_transporter_loading_light.png"> </div> <div class="custom-control custom-switch"> <input type="checkbox" class="custom-control-input" > <label class="custom-control-label" for="create-trade-route-export-checkbox"> <img class="icon-sm icon-light" src="icons/icon_transporter_unloading_light.png"> </label> </div> </div> <div class="input-group input-group-short spinner"> <input step="0.1" class="form-control" type="number" value="0" > <div class="input-group-append"> <span class="input-group-text">t/min</span> </div> </div> <button class="btn btn-sm btn-light" disabled=""> <span class="fa fa-plus"></span> </button> </form> </div>

<div class="float-left mr-2"> <button class="btn btn-light btn-sm" > <span class="fa fa-sliders"></span> </button> </div>
<p><b>Trade routes are created</b> from the <b>factory configuration dialog</b> of a factory that normally produces this product. There are two kinds of trade routes. The first kind are routes to <b>purchase goods from a trader</b>. Selecting the checkbox next to the trader creates such a route. The second kind are routes to <b>transfer goods between islands</b>. Like for extra goods, the extra demand is increased on one side and decreased on the other. When opening the factory configuration dialog, the calculator enters the <b>overproduction</b> into the amount input field for a new trade route. When production or island demand change, buttons show up next to suitable trade routes that allow to add the difference. A <span class="fa fa-exclamation-triangle " style="color:red"></span> on an input field signals that the source island does not produce enough to fully supply the trade route.</p><br/>

<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"> <img data-toggle="modal" data-target="#trade-routes-management-dialog" class="icon-navbar" src="icons/icon_shiptrade.png"> </button></span>
<p>The trade route menu contains an overview of all trade routes, listed in the order of creation. One can delete trade routes and adjust their load there.</p><br/>
<span>Please note that <b>routes are attached to factories</b>. This means that an import must be configured on the factory that produces the good on the source island. The demand must therefore be associated with the correct factory on the importing island. The settings can be changed via </span>
<span class="btn-group bg-dark">
<button class="btn text-light"><span class="fa fa-cogs"></span></button>
</span>
<span> in the navigation bar. Otherwise it may happen that for instance existing coal mines produce sufficient goods, but the demand is associated with charcoal kilns. It is not possible to produce one input good for one factory by different other factories. One must <b>stick with one type of factory</b> and simulate the production of other factories by artificial trade routes from artificial islands.</span><br/>
<br/>

<h5>Docklands</h5>
<span class="float-left btn-group bg-dark mr-2"><button type="button" class="btn"> <img class="icon-navbar" src="icons/icon_docklands_2d_white.png"> </button></span>
<p>Docklands offers an enormous potential to trade goods and to focus on efficient production chains. But the game provides limited information to compute the required production capacities required for the export. Therefore, trade contracts in the calculator are based on t/min. The calculator computes the amount in tons that must be entered into the in-game contract to achieve the desired flow of goods. <b>Creating a contract</b> is like creating a trade route. One configures the number of goods and the exchange product in the <b>factory configuration dialog</b>. The switch in the middle toggles between exporting and importing the product of the selected factory. If no switch is shown, the good cannot be imported. <b>When selecting particular exchange products, an additional selection box appears.</b> There, one has to choose the factory where the good is added or subtracted. In every selection box, one can directly jump to the term by typing the first letters. The plus button creates a route. Afterwards, the route is shown at the import and export factory. The docklands dialog shows an overview of all contracts for one island. One can switch between the dialogs by clicking on the product icons.</p>
<p>The upper part of the dialog shows the <b>export pyramid</b>. New entries are added by selecting a product and a multiplier. Rearranging the pyramid is achieved by deleting and recreating the entries. Existing contracts are updated such that the imported tons per minute remain the same.</p>
<img src="wheel_input.gif" class="float-left" style="margin: 0.5rem 0.5rem 0 0"/>
<p>The lower part of the dialog shows an overview of all contracts and summary information about the trade. First of all, one has to enter the <b>loading speed of the pier</b> where Tobias trades and his <b>travel time</b> (where the latter has a sensible default value). The loading speed is displayed in the lower part of the pier's information panel in the game. The calculator computes the trading duration, the total stock turnover in t/min, the island's required storage capacity, and the tons one must enter for each contract. The calculation of these values includes the loading speed bonus for Tobias and the duration to enter and leave the session. In case ∞ is displayed, the entered stock turnover exceeds the maximum. Then, one must distribute the contracts over more islands, increase the loading speed or reduce the traded volume.</p>
<p>There is a second use case, where one wants to trade as many goods as possible per trade. First of all, one has to specify all the trade contracts and the loading speed. Here, the absolute amount per contract does not matter, only the relative difference between different contracts. Then, enter the total island storage capacity and click the button <b>Set total capacity</b> next to it. It determines the good that requires the maximal storage capacity c. It scales the contract by a factor f such that c matches the island storage capacity. Finally, f is applied to all other contracts. If the lock symbol next to a contract is clicked, it is not modified.</p>
<p><b>All Islands</b> (selected by default, if no island management is active) behaves a bit different. It allows to <b>import and export</b> the same good so that one can aggregate the contracts of several docklands. But it does not show the summary information about the trade.</p>
<br/>

<h5>Seeds of Change</h5>
<p>The <b>Hacienda</b> affects many game mechanics and configuration options are scattered across the calculator. Here is a short overview: The resident quarters can be found in the <b>population configuration</b> menu by expanding the <b>Residences</b> dropdown. The <b>Dietary Education Initiative</b> is available in the newspaper dialog. Hacienda farms can be selected in the production chain configuration menu. The <b>same region</b> option favors the traditional production buildings - if both are in the same region. New islands will be configured to use the traditional ones. Existing islands from older configurations use the same region option for all products that now have new production buildings. This means that beer consumed by Obreras is assumed to be produced by Hacienda Brewery.</p>
<p>The <b>fertiliser chain</b> works like silos. Each farm has an extra checkbox to enable it. This will induce productivity increase, extra goods, and fertiliser consumption. For old world farms, one has to open the factory configuration dialog to see this checkbox. Dung production is special, however. There is no standard factory in the game to produce it, so I created an artificial one: <b>All Animal Farms</b>. Its purpose is to keep track of all produced dung. The production statistics are derived from the dung production of an alpaca farm. So, one can use this artificial production building directly. The correct way, however, is via <b>extra goods</b>. The dung production on an animal farm is enabled like you would equip an item. The collected dung is shown in the extra goods section of the All Animal Farms and then processed by the Fertilizer Works - which is one of the few factories where product and factory icon differ.</p> 
<br/>

<h5>Disclaimer</h5>
<p>The calculator is provided without warranty of any kind. The work was NOT endorsed by Ubisoft Blue Byte in any kind. All the assets from Anno 1800 game are © by Ubisoft.</p><br/>
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

