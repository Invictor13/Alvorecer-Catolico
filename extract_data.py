import json
import os

datasets = {
    "igreja": [
        {
            "id": 1, "year": "33 d.C.", "century": "antiga", "title": "Pentecostes e Jerusalém", "era": "Era Apostólica", "ccc": "CIC § 767", "region": "Jerusalém, Judeia", "coords": [31.7683, 35.2137], "zoom": 7,
            "overview": "Descida do Espírito Santo sobre Maria Santíssima e os Apóstolos no Cenáculo (Atos 2). Jerusalém torna-se a matriz maternal da Santa Igreja universal.",
            "theology": "Fundação pneumatológica da Igreja. A graça batismal e a efusão do Espírito Santo inauguram a Grande Comissão aos povos.",
            "quote": "«Recebereis a força do Espírito Santo que virá sobre vós, e sereis minhas testemunhas em Jerusalém e até aos confins da terra.» — Atos 1, 8",
            "figures": "São Pedro, Nossa Senhora, São Tiago Menor, São João.",
            "artTitle": "O Pentecostes de Tiziano & Catacumbas Romanas", "artDesc": "Afrescos paleocristãos do Bom Pastor nas Catacumbas de Priscila e o Mosaico de Jerusalém.",
            "routes": []
        },
        {
            "id": 2, "year": "49 d.C.", "century": "antiga", "title": "Concílio de Jerusalém", "era": "Expansão Primitiva", "ccc": "CIC § 874", "region": "Antioquia e Jerusalém", "coords": [36.2021, 36.1600], "zoom": 6,
            "overview": "Primeira assembleia decisória da Igreja. Define que os gentios convertidos não necessitam da circuncisão ritual judaica.",
            "theology": "Universatilidade soteriológica. A Graça divina redentora superou a vigência das leis rituais da Antiga Aliança.",
            "quote": "«Acreditamos que somos salvos pela graça do Senhor Jesus, do mesmo modo que eles.» — Atos 15, 11",
            "figures": "São Paulo, São Pedro, São Barnabé.",
            "artTitle": "São Paulo Pregando aos Gentios", "artDesc": "Ilustrações de manuscritos sírios e Bizantinos medievais.",
            "routes": [{"from": [31.7683, 35.2137], "to": [36.2021, 36.1600], "label": "Viagem Apostólica de Paulo e Pedro"}]
        },
        {
            "id": 3, "year": "64 - 313 d.C.", "century": "antiga", "title": "Era dos Mártires e Catacumbas", "era": "Perseguições Império", "ccc": "CIC § 2473", "region": "Roma, Itália", "coords": [41.9028, 12.4964], "zoom": 6,
            "overview": "Perseguições imperiais sob Nero até Diocleciano. O sangue dos mártires rega a terra e multiplica o número de cristãos.",
            "theology": "Testemunho supremo de fé (martyrion). Configuração perfeita a Cristo crucificado na doação da própria vida.",
            "quote": "«Sanguis martyrum semen christianorum» (O sangue dos mártires é semente de novos cristãos). — Tertuliano",
            "figures": "São Pedro, São Paulo, Santa Inês, São Lourenço, São Inácio de Antioquia.",
            "artTitle": "Catacumbas de São Calisto", "artDesc": "Símbolos paleocristãos: O Peixe (ICHTHYS), a Âncora e o Pavão real.",
            "routes": [{"from": [36.2021, 36.1600], "to": [41.9028, 12.4964], "label": "Martírio dos Apóstolos em Roma"}]
        },
        {
            "id": 4, "year": "313 d.C.", "century": "antiga", "title": "Édito de Milão", "era": "Igreja Imperial", "ccc": "CIC § 2104", "region": "Milão, Itália", "coords": [45.4642, 9.1900], "zoom": 6,
            "overview": "Constantino e Licínio promulgam a liberdade religiosa. Fim das perseguições imperiais e início do culto público ostensivo.",
            "theology": "Reconhecimento da dignidade da consciência humana e edificação das Basílicas Patriarcais.",
            "quote": "«Concedemos aos cristãos e a todos os outros a livre faculdade de seguir a religião que quisessem.» — Édito de Milão",
            "figures": "Imperador Constantino, Santa Helena, Papa Silvestre I.",
            "artTitle": "Mosaico do Chi-Rho Imperial", "artDesc": "Monograma Constantiniano do Labarum nas Basílicas de Roma e Constantinopla.",
            "routes": [{"from": [41.9028, 12.4964], "to": [45.4642, 9.1900], "label": "Decreto Imperial de Liberação"}]
        },
        {
            "id": 5, "year": "325 d.C.", "century": "antiga", "title": "I Concílio de Niceia", "era": "Patrística", "ccc": "CIC § 242", "region": "Niceia, Bitínia (Turquia)", "coords": [40.4287, 29.7214], "zoom": 6,
            "overview": "Primeiro Concílio Ecumênico. Condenação solene da heresia de Ário e formulação dogmática do Credo Niceno.",
            "theology": "Consubstancialidade divina do Filho com o Pai (Homoousios). Cristo é Deus verdadeiro de Deus verdadeiro.",
            "quote": "«Deus de Deus, Luz da Luz, Deus verdadeiro de Deus verdadeiro, gerado, não criado, consubstancial ao Pai.» — Credo Niceno",
            "figures": "Santo Atanásio de Alexandria, Bispo Hosius, São Nicolau.",
            "artTitle": "Ícone dos 318 Padres Conciliares", "artDesc": "Iconografia ortodoxa clássica representando o Tomo do Credo Niceno.",
            "routes": [{"from": [45.4642, 9.1900], "to": [40.4287, 29.7214], "label": "Assembleia Episcopal Bispos"}]
        },
        {
            "id": 6, "year": "529 d.C.", "century": "media", "title": "Fundação de Monte Cassino", "era": "Monacato Ocidental", "ccc": "CIC § 918", "region": "Monte Cassino, Itália", "coords": [41.4883, 13.8167], "zoom": 7,
            "overview": "São Bento funda o mosteiro ápice da civilização cristã e redige a Santa Regra 'Ora et Labora' (Oração e Trabalho).",
            "theology": "Consagração monástica e preservação da Bíblia e cultura greco-romana pelos Scriptoriums.",
            "quote": "«Nihil Operi Dei praeponatur» (Nada se anteponha ao Serviço de Deus). — Regra de São Bento",
            "figures": "São Bento de Núrsia, Santa Escolástica.",
            "artTitle": "Manuscritos Iluminados Beneditinos", "artDesc": "Códices e bíblias ornamentadas com iluminuras em ouro e lápis-lazúli.",
            "routes": [{"from": [40.4287, 29.7214], "to": [41.4883, 13.8167], "label": "Difusão da Regra Beneditina"}]
        },
        {
            "id": 7, "year": "800 d.C.", "century": "media", "title": "Coroação de Carlos Magno", "era": "Sacro Império", "ccc": "CIC § 2244", "region": "Roma & Aachen", "coords": [50.7753, 6.0839], "zoom": 5,
            "overview": "O Papa Leão III coroa Carlos Magno na Basílica de São Pedro na noite de Natal. Nasce o Sacro Império Romano-Germânico.",
            "theology": "Concepção da Cristandade ocidental e colaboração harmoniosa entre Trono e Altar.",
            "quote": "«A Carlos Augusto, coroado por Deus, grande e pacífico imperador dos Romanos, vida e vitória!»",
            "figures": "Papa Leão III, Imperador Carlos Magno, Alcuíno de York.",
            "artTitle": "A Coroa Imperial de Carlos Magno", "artDesc": "Joalheria sacra carolíngia preservada no Tesouro de Viena.",
            "routes": [{"from": [41.4883, 13.8167], "to": [50.7753, 6.0839], "label": "Aliança com os Francos"}]
        },
        {
            "id": 8, "year": "1054 d.C.", "century": "media", "title": "O Grande Cisma do Oriente", "era": "Cisma", "ccc": "CIC § 817", "region": "Constantinopla", "coords": [41.0082, 28.9784], "zoom": 5,
            "overview": "Ruptura trágica de comunhão entre a Igreja Latina Ocidental e os Patriarcados Ortodoxos Orientais.",
            "theology": "Controvérsias do Filioque, jurisdição primacial romana e pão ázimo nas espécies eucarísticas.",
            "quote": "«Que a paz de Deus reine onde quer que haja boa vontade entre os homens de fé.»",
            "figures": "Patriarca Miguel Cerulário, Cardeal Humberto de Silva Candida.",
            "artTitle": "A Basílica de Santa Sofia", "artDesc": "Arquitetura e mosaicos dourados da Cristandade Bizantina.",
            "routes": [{"from": [50.7753, 6.0839], "to": [41.0082, 28.9784], "label": "Ruptura Eclesiástica"}]
        },
        {
            "id": 9, "year": "1210 - 1216 d.C.", "century": "media", "title": "Eclosão das Ordens Mendicantes", "era": "Renovação Evangélica", "ccc": "CIC § 919", "region": "Assis & Roma", "coords": [43.0643, 12.6033], "zoom": 6,
            "overview": "São Francisco e São Domingos fundam as Ordens dos Frades Menores (Franciscanos) e Pregadores (Dominicanos).",
            "theology": "Pobreza evangélica radical, combate intelectual às heresias e pregação apostólica itinerante.",
            "quote": "«Francisco, vai e repara a minha Igreja que está em ruínas.» — Revelação do Crucifixo de São Damião",
            "figures": "São Francisco de Assis, São Domingos de Gusmão, Papa Inocêncio III.",
            "artTitle": "Afrescos de Giotto na Basílica de Assis", "artDesc": "Representação magistral do Sonho de Inocêncio III e estigmas de São Francisco.",
            "routes": []
        },
        {
            "id": 10, "year": "1274 d.C.", "century": "media", "title": "A Suma Teológica de Tomás de Aquino", "era": "A Escolástica", "ccc": "CIC § 39", "region": "Paris & Nápoles", "coords": [48.8566, 2.3522], "zoom": 5,
            "overview": "São Tomás de Aquino sintetiza com perfeição monumental a filosofia aristotélica com a Revelação divina cristã.",
            "theology": "Harmonia sublime entre Razão (Ratio) e Fé (Fides). As Cinco Vias da demonstração da existência de Deus.",
            "quote": "«A Fé não destrói a Razão, mas supõe-na e eleva-a à perfeição.» — São Tomás de Aquino",
            "figures": "São Tomás de Aquino, São Boaventura, Santo Alberto Magno.",
            "artTitle": "O Triunfo de São Tomás de Aquino", "artDesc": "Pintura de Benozzo Gozzoli e afrescos das Universidades Medievais.",
            "routes": [{"from": [43.0643, 12.6033], "to": [48.8566, 2.3522], "label": "Florescimento Universitário"}]
        },
        {
            "id": 11, "year": "1545 - 1563 d.C.", "century": "moderna", "title": "O Sagrado Concílio de Trento", "era": "Contrarreforma", "ccc": "CIC § 1376", "region": "Trento, Itália", "coords": [46.0679, 11.1211], "zoom": 6,
            "overview": "O maior concílio dogmático da era moderna reafirma a Tradição, os sete Sacramentos e reforma os Seminários.",
            "theology": "Definição dogmática da Transubstanciação Eucarística, Justificação pela Graça e obras e o Cânone da Bíblia.",
            "quote": "«Se alguém disser que os sacramentos da Nova Lei não foram instituídos por Cristo, seja anátema.»",
            "figures": "São Carlos Borromeu, Santo Inácio de Loyola, Papa Pio V.",
            "artTitle": "Sessão Conciliar no Duomo de Trento", "artDesc": "Gravuras e quadros barrocos glorificando o Santo Sacrifício da Missa.",
            "routes": [{"from": [48.8566, 2.3522], "to": [46.0679, 11.1211], "label": "Reforma Católica Tridentina"}]
        },
        {
            "id": 12, "year": "1962 - 1965 d.C.", "century": "contemporanea", "title": "II Concílio Ecumênico do Vaticano", "era": "Era Contemporânea", "ccc": "CIC § 816", "region": "Vaticano, Roma", "coords": [41.9029, 12.4534], "zoom": 6,
            "overview": "Convocado pelo Papa São João XXIII. Renovação pastoral, ecumenismo, liturgia no vernáculo e diálogo com o mundo.",
            "theology": "Construção da Constituição Lumen Gentium (A Igreja como Luz das Nações) e Gaudium et Spes.",
            "quote": "«Quero abrir as janelas da Igreja para que possamos ver o que acontece do lado de fora.» — São João XXIII",
            "figures": "São João XXIII, São Paulo VI, Cardeal Joseph Ratzinger, Karol Wojtyła.",
            "artTitle": "Fotografias da Abertura Solene da Basílica de São Pedro", "artDesc": "Milhares de Bispos reunidos na nave central da Basílica Papal.",
            "routes": [{"from": [46.0679, 11.1211], "to": [41.9029, 12.4534], "label": "Assembleia Conciliar Global"}]
        },
        {
            "id": 13, "year": "2026 d.C.", "century": "contemporanea", "title": "A Igreja Global Sinodal", "era": "Terceiro Milênio", "ccc": "CIC § 782", "region": "Mundo Inteiro", "coords": [41.9029, 12.4534], "zoom": 3,
            "overview": "Mais de 1,38 bilhão de fiéis católicos espalhados por todos os continentes sob a liderança do Papa Francisco.",
            "theology": "Sinodalidade, ecologia integral, comunhão missionária e fraternidade humana universal.",
            "quote": "«Uma Igreja em saída com as portas abertas para acolher e evangelizar todas as periferias.» — Papa Francisco",
            "figures": "Papa Francisco, Colegiado dos Cardeais e Bispos do Mundo.",
            "artTitle": "Jornada Mundial da Juventude & Missão Universal", "artDesc": "A bandeira das nações reunida na fé católica.",
            "routes": [{"from": [41.9029, 12.4534], "to": [-22.9068, -43.1729], "label": "Apostolado nos Cinco Continentes"}]
        }
    ],
    "santos": [
        {
            "id": 1, "year": "354 - 430 d.C.", "century": "antiga", "title": "Santo Agostinho de Hipona", "era": "Doutor da Graça", "ccc": "CIC § 385", "region": "Hipona, Argélia", "coords": [36.9000, 7.7667], "zoom": 5,
            "overview": "Bispo e Doutor da Igreja. Escreveu 'Confissões' e 'A Cidade de Deus', moldando para sempre a teologia ocidental.",
            "theology": "A absoluta necessidade da Graça divina para a salvação e superação do pecado original.",
            "quote": "«Fizeste-nos, Senhor, para Ti, e o nosso coração permanece inquieto enquanto não descansar em Ti.»",
            "figures": "Santo Agostinho, Santa Mônica, Santo Ambrósio de Milão.",
            "artTitle": "Santo Agostinho no seu Estúdio por Botticelli", "artDesc": "Retrato renascentista clássico representando a reflexão teológica augustiniana.",
            "routes": []
        },
        {
            "id": 2, "year": "1491 - 1556 d.C.", "century": "moderna", "title": "Santo Inácio de Loyola", "era": "Companhia de Jesus", "ccc": "CIC § 2015", "region": "Manresa & Roma", "coords": [41.5983, 1.8301], "zoom": 6,
            "overview": "Fundador dos Jesuítas e autor dos 'Exercícios Espirituais'. Batalhador do Rei Eterno na expansão missionária.",
            "theology": "Contemplação na ação e busca permanente da Maior Glória de Deus (Ad Maiorem Dei Gloriam).",
            "quote": "«Em tudo amar e servir a Sua Divina Majestade.» — Santo Inácio de Loyola",
            "figures": "Santo Inácio, São Francisco Xavier, São Pedro Fabro.",
            "artTitle": "Cova de Manresa & Igreja do Gesù", "artDesc": "Arte barroca glorificando a transverberação e envio dos Jesuítas.",
            "routes": [{"from": [41.5983, 1.8301], "to": [41.9028, 12.4964], "label": "Aprovação Papal da Ordem"}]
        },
        {
            "id": 3, "year": "1920 - 2005 d.C.", "century": "contemporanea", "title": "São João Paulo II", "era": "Papa Magno", "ccc": "CIC § 221", "region": "Wadowice & Roma", "coords": [49.8833, 19.4833], "zoom": 5,
            "overview": "Um dos maiores papas da história humana. Visitou 129 países, fundou a JMJ e ajudou a derrubar o comunismo ateu.",
            "theology": "Teologia do Corpo, Evangelium Vitae e a Divina Misericórdia de Jesus.",
            "quote": "«Não tenhais medo! Abri, melhor, escancarai as portas a Cristo!» — São João Paulo II",
            "figures": "São João Paulo II, Santa Faustina Kowalska, Cardeal Ratzinger.",
            "artTitle": "Basílica de São Pedro & Santuário da Divina Misericórdia", "artDesc": "Fotografias do Pontificado do Grande Papa da Família.",
            "routes": [{"from": [49.8833, 19.4833], "to": [41.9029, 12.4534], "label": "Sua Eleição Papal em 1978"}]
        }
    ],
    "concilios": [
        {
            "id": 1, "year": "451 d.C.", "century": "antiga", "title": "Concílio de Calcedônia", "era": "Quarto Ecumênico", "ccc": "CIC § 467", "region": "Calcedônia (Istambul)", "coords": [40.9900, 29.0200], "zoom": 6,
            "overview": "Condenou o Monofisismo de Eutiques. Definiu as duas naturezas de Cristo, divina e humana, unidas sem confusão.",
            "theology": "União Hipostática. Jesus Cristo é perfeito Deus e perfeito homem.",
            "quote": "«Pedro falou pela boca de Leão!» — Aclamação dos Padres Conciliares",
            "figures": "Papa São Leão Magno, Imperador Marciano.",
            "artTitle": "Mosaicos Paleocristãos Bizantinos", "artDesc": "Representação iconográfica do Tomo a Flaviano enviado pelo Papa Leão.",
            "routes": []
        },
        {
            "id": 2, "year": "1869 - 1870 d.C.", "century": "contemporanea", "title": "I Concílio do Vaticano", "era": "Vaticano I", "ccc": "CIC § 891", "region": "Vaticano, Roma", "coords": [41.9029, 12.4534], "zoom": 6,
            "overview": "Promulgado pelo Papa Beato Pio IX. Definiu o dogma da Infalibilidade Papal quando falando ex cathedra.",
            "theology": "Dogma da Infalibilidade do Romano Pontífice em matérias de Fé e Moral e primado de jurisdição.",
            "quote": "«O Bispo de Roma, quando fala ex cathedra, possui aquela infalibilidade de que o Divino Redentor quis dotar a sua Igreja.»",
            "figures": "Beato Papa Pio IX, Cardeal Manning.",
            "artTitle": "Sessão Solene no Palácio Apostólico", "artDesc": "Pinturas do Século XIX retratando os Bispos reunidos com o Papa Pio IX.",
            "routes": []
        }
    ],
    "milagres": [
        {
            "id": 1, "year": "750 d.C.", "century": "media", "title": "Milagre Eucarístico de Lanciano", "era": "Eucarístico", "ccc": "CIC § 1374", "region": "Lanciano, Itália", "coords": [42.2278, 14.3892], "zoom": 6,
            "overview": "Sacerdote duvidou da Presença Real. A Hóstia converteu-se em Carne Sangrenta e o Vinho em Sangue verdadeiro.",
            "theology": "Confirmação visível do Dogma da Transubstanciação. Exames científicos comprovam tecido miocárdico humano (Grupo AB).",
            "quote": "«Eis a Carne e o Sangue do nosso diletíssimo Cristo, gerado para a nossa Salvação!»",
            "figures": "Monge Basiliano anônimo, Cientista Linoli (Análises 1971).",
            "artTitle": "O Relicário de Prata e Cristal de Lanciano", "artDesc": "O ostensório sagrado onde estão preservadas as espécies milagrosas incorruptas.",
            "routes": []
        },
        {
            "id": 2, "year": "1917 d.C.", "century": "contemporanea", "title": "Nossa Senhora de Fátima", "era": "Aparição Mariana", "ccc": "CIC § 67", "region": "Fátima, Portugal", "coords": [39.6172, -8.6521], "zoom": 6,
            "overview": "A Virgem Maria aparece a três pastorinhos na Cova da Iria. No dia 13 de Outubro ocorreu o Milagre do Sol para 70.000 testemunhas.",
            "theology": "Apelo à oração do Santo Rosário, reparação ao Imaculado Coração e conversão dos pecadores.",
            "quote": "«Por fim, o Meu Imaculado Coração triunfará!» — Nossa Senhora de Fátima",
            "figures": "Lúcia dos Santos, São Francisco Marto, Santa Jacinta Marto.",
            "artTitle": "O Santuário da Cova da Iria", "artDesc": "A Capelinha das Aparições e o Sol Dançante testemunhado pelos jornais da época.",
            "routes": []
        }
    ]
}

quizQuestions = [
    {
        "question": "Em que ano ocorreu o evento de Pentecostes, considerado a manifestação pública do nascimento da Igreja Católica?",
        "options": ["33 d.C.", "313 d.C.", "325 d.C.", "1054 d.C."],
        "answer": 0,
        "explanation": "O Pentecostes ocorreu no ano 33 d.C. em Jerusalém, quando o Espírito Santo desceu sobre os Apóstolos no Cenáculo (CIC § 767)."
    },
    {
        "question": "Qual foi o primeiro Concílio Ecumênico da História da Igreja que formulou o Credo sobre a divindade de Cristo?",
        "options": ["Concílio de Trento", "I Concílio de Niceia", "Concílio de Calcedônia", "Vaticano II"],
        "answer": 1,
        "explanation": "O I Concílio de Niceia (325 d.C.) proclamou que Jesus é consubstancial (Homoousios) ao Pai, derrotando o arianismo (CIC § 242)."
    },
    {
        "question": "Onde São Bento fundou o mosteiro do qual emanou a Santa Regra 'Ora et Labora'?",
        "options": ["Assis", "Monte Cassino", "Paris", "Roma"],
        "answer": 1,
        "explanation": "São Bento fundou o Mosteiro de Monte Cassino na Itália por volta de 529 d.C., salvando a cultura do Ocidente (CIC § 918)."
    },
    {
        "question": "Qual grande doutor da Igreja escreveu a monumental 'Suma Teológica', harmonizando Fé e Razão?",
        "options": ["Santo Agostinho", "São Tomás de Aquino", "São Francisco", "Santo Inácio"],
        "answer": 1,
        "explanation": "São Tomás de Aquino (O Doutor Angélico) escreveu a Suma Teológica no século XIII, sendo a pauta doutrinária suprema da Igreja (CIC § 39)."
    }
]

flashcards = [
    { "frontTitle": "Pentecostes (33 d.C.)", "frontTag": "Marco Fundamental", "backText": "Descida do Espírito Santo sobre Maria e os Apóstolos no Cenáculo. Nascimento da Igreja Universal.", "ccc": "CIC § 767" },
    { "frontTitle": "Édito de Milão (313 d.C.)", "frontTag": "Liberdade Religiosa", "backText": "Decreto promulgado por Constantino que encerrou as perseguições imperiais aos cristãos.", "ccc": "CIC § 2104" },
    { "frontTitle": "Concílio de Trento (1545 d.C.)", "frontTag": "Contrarreforma Dogmática", "backText": "Reafirmou a Transubstanciação Eucarística, os 7 Sacramentos, a Vulgata Sagrada e os Seminários.", "ccc": "CIC § 1376" },
    { "frontTitle": "Milagre de Lanciano (750 d.C.)", "frontTag": "Milagre Eucarístico", "backText": "Hóstia transformada em tecido Miocárdico humano incorrupto e vinho em Sangue AB.", "ccc": "CIC § 1374" }
]

base_dir = "Conteudo/periodos"

for key, data in datasets.items():
    dir_path = os.path.join(base_dir, key)
    os.makedirs(dir_path, exist_ok=True)
    with open(os.path.join(dir_path, "data.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

os.makedirs(os.path.join(base_dir, "estudos"), exist_ok=True)
with open(os.path.join(base_dir, "estudos", "quiz.json"), "w", encoding="utf-8") as f:
    json.dump(quizQuestions, f, ensure_ascii=False, indent=2)
with open(os.path.join(base_dir, "estudos", "flashcards.json"), "w", encoding="utf-8") as f:
    json.dump(flashcards, f, ensure_ascii=False, indent=2)

print("Data extracted successfully.")
