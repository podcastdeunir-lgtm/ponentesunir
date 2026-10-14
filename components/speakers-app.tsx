'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Users, Radar, CalendarDays, Plus, SlidersHorizontal, ArrowUpRight, MoreHorizontal, MapPin, Mail, Phone, Linkedin, X, ChevronRight, Check, Clock3, ThumbsUp, ThumbsDown, MessageSquare, ImagePlus, ShieldCheck, Play, Trophy, Captions, Bell, FileDown } from 'lucide-react';
import { ForumPlanner } from '@/components/forum-planner';

type Recommendation = 'repetir'|'no_repetir'|'pendiente';
type ParticipationReview = { rating?:number; note?:string };
type Person = { id:number; name:string; role:string; company:string; tags:string[]; place:string; state:'Activo'|'Pendiente'; initials:string; color:string; bio:string; email:string; phone:string; joined:string; rating?:number; photoUrl?:string; linkedinUrl?:string; recommendation?:Recommendation; internalNote?:string; };
type Candidate = { name:string; role:string; company:string; tags:string[]; source:string; state:string; initials:string; color:string; bio?:string; internalNote?:string; linkedinUrl?:string; videoUrl?:string };
type Forum = { name:string; date:string; theme:string; people:string[]; presenter?:string; startsAt?:string; endsAt?:string; sourceUrl?:string; sourceLabel?:string; youtubeUrl?:string; previewImage?:string; previewClipUrl?:string; previewClipStart?:string; recentEmission?:boolean; summary?:string; program?:string[] };
const people: Person[] = [
 {id:1,name:'Edgar Guillermo Solano',role:'Consultor de gamificación e innovación',company:'Centro de Innovación',tags:['Educación','Tecnología','Empresa'],place:'Colombia',state:'Activo',initials:'ES',color:'#80c9dc',bio:'Consultor, conferencista y creador de metodologías de juego y estrategia para impulsar procesos de innovación, educación y desarrollo.',email:'',phone:'',joined:'29 may 2025',rating:5,photoUrl:'https://media.licdn.com/dms/image/v2/C4E03AQGu-1CXn3F0YA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1628176790502?e=1792627200&v=beta&t=iul-eF-ijXwBQeubkJMTSgif6gOU2wnCxqlkMAAr90w',linkedinUrl:'https://www.linkedin.com/in/solanobrainer',recommendation:'repetir',internalNote:'Dibuja en vivo durante sus presentaciones. Fue muy bien recibido; destacó como referente de gamificación para la educación y desarrolló un proyecto muy exitoso en Colombia.'},
 {id:2,name:'Sara Muñoz Cadena',role:'Investigadora de la Escuela de Gobierno',company:'Universidad de los Andes',tags:['Derecho','IA','Educación'],place:'Colombia',state:'Activo',initials:'SM',color:'#f49a9a',bio:'Investigadora en asuntos relacionados con transparencia algorítmica y política pública digital.',email:'',phone:'',joined:'4 mar 2025',rating:5,photoUrl:'https://media.licdn.com/dms/image/v2/D4E03AQE-Vi_9Cxtg8Q/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1671758037681?e=1792627200&v=beta&t=o7jgI476rbQRQqiPgLVJiWqYPd5VGWAeNWsiUfmw3cw',linkedinUrl:'https://www.linkedin.com/in/sarah-mu%C3%B1oz-cadena-03063225a',recommendation:'repetir',internalNote:'Excelente conferencia. Presentación exitosa y con gran acogida; muy asertiva, dinámica, educativa y carismática.'},
 {id:3,name:'Luis Gabriel Degiovanni',role:'Personero de Montería y presidente de Fenalper',company:'Fenalper',tags:['Derecho','Gobierno','IA'],place:'Colombia',state:'Activo',initials:'LD',color:'#c38a64',bio:'Abogado y responsable público con experiencia en administración y representación institucional.',email:'',phone:'',joined:'4 mar 2025',rating:4,photoUrl:'https://www.wradio.com.co/resizer/v2/IZEUAIASNNBIXP7X7XBHI4CMGM.jpg?auth=c63e328704350be25f41c8d5a001808d68fe1750c685ed7fa5c1e9207c1e2d75&height=900&quality=70&smart=true&width=1200',internalNote:'Panelista de mesa redonda.'},
 {id:4,name:'Libia Rivas Ordóñez',role:'Presidenta',company:'Instituto Ecuatoriano de Estudios Legislativos',tags:['Derecho','Gobierno','Educación'],place:'Ecuador',state:'Activo',initials:'LR',color:'#eb7676',bio:'Experta en asuntos legislativos, contratación pública y docencia universitaria.',email:'',phone:'',joined:'4 mar 2025',rating:4},
 {id:5,name:'Enrique Zapata Pérez',role:'Especialista en Transformación Digital',company:'CAF · Banco de Desarrollo de América Latina y el Caribe',tags:['IA','Gobierno','GovTech','Datos abiertos'],place:'México',state:'Activo',initials:'EZ',color:'#b7d6a8',bio:'Especialista en Transformación Digital de CAF. Su trayectoria se centra en inteligencia de datos, nuevas tecnologías, gobierno abierto y GovTech; fue coordinador de IA y GovTech de Ciudad de México.',email:'',phone:'',joined:'4 mar 2025',rating:5,recommendation:'repetir',internalNote:'Foro UNIR: abordó cómo la colaboración público-privada puede aplicar IA con eficiencia, transparencia y rendición de cuentas. Subrayó marcos regulatorios claros para proteger la privacidad y la seguridad de los datos. Valoración interna previa: respuestas y comentarios muy asertivos.'},
 {id:6,name:'Giovanna Miranda Chacón',role:'Subdirección Médica Administrativa',company:'Fundación Valle del Lili',tags:['Salud','Empresa','Tecnología'],place:'Colombia',state:'Activo',initials:'GM',color:'#d5a4d9',bio:'Médica especialista en administración sanitaria, calidad y mejora continua en instituciones de salud.',email:'',phone:'',joined:'3 nov 2025',rating:4,internalNote:'Pertenece a la mesa directiva del centro hospitalario número 1 de Colombia y uno de los mejor calificados en calidad de Latinoamérica.'},
 {id:7,name:'Nathalie Vélez Ponce',role:'Directora',company:'LUMO MediaLab · Caracol Televisión',tags:['Empresa','Tecnología','Comunicación'],place:'Colombia',state:'Activo',initials:'NV',color:'#e4c365',bio:'Directiva de innovación y transformación digital en medios y entretenimiento.',email:'',phone:'',joined:'19 mar 2025',rating:5,recommendation:'repetir',internalNote:'Su participación gustó mucho.'},
 {id:8,name:'Walter Cabanillas',role:'Startup Mentor Advisor',company:'INNOVA ESAN',tags:['Empresa','IA','Tecnología'],place:'Perú',state:'Activo',initials:'WC',color:'#d3ab6e',bio:'Mentor de startups con experiencia en innovación, desarrollo de negocio y mercados latinoamericanos.',email:'',phone:'',joined:'19 mar 2025',rating:4},
 {id:9,name:'Edwin Santos Esparza',role:'Principal Chief Executive Officer',company:'Instituto para la Democracia Digital',tags:['Gobierno','IA','Tecnología'],place:'Perú',state:'Activo',initials:'ES',color:'#9dca91',bio:'Especialista en transformación digital, ciudadanía y políticas públicas.',email:'',phone:'',joined:'19 mar 2025',rating:4},
 {id:10,name:'Rosa María Romero Zúñiga',role:'Psicóloga y especialista en Medicina Social',company:'UNITECH · Universidad Tecnológica de México',tags:['Salud','Psicología','Educación'],place:'México',state:'Activo',initials:'RR',color:'#d49bd7',bio:'Psicóloga especializada en salud mental, orientación profesional y desarrollo de habilidades personales.',email:'',phone:'',joined:'12 mar 2025',rating:4},
 {id:11,name:'Enric Armengou Orús',role:'Psiquiatra',company:'ITA Salud Mental · Fundación Ayuda y Esperanza',tags:['Salud','Psicología','Educación'],place:'España',state:'Activo',initials:'EA',color:'#cda0dd',bio:'Psiquiatra especializado en la atención a trastornos límite de la personalidad y conducta autolesiva.',email:'',phone:'',joined:'4 mar 2025',rating:4,internalNote:'Autor de varios libros sobre su campo de especialización.'},
 {id:12,name:'Daniel Vega Moreno',role:'Psicólogo adjunto',company:'Hospital de Igualada',tags:['Salud','Psicología','Educación'],place:'España',state:'Activo',initials:'DV',color:'#bba0d8',bio:'Psicólogo clínico vinculado a psiquiatría y salud mental; especialista en trastornos de personalidad y autolesión.',email:'',phone:'',joined:'4 mar 2025',rating:4},
 {id:13,name:'Fernando de la Cruz Prego',role:'Director académico',company:'UNIR',tags:['Educación','Derecho','Ciencia'],place:'España',state:'Activo',initials:'FC',color:'#8eacdb',bio:'Doctor en estudios del desarrollo y profesor universitario.',email:'',phone:'',joined:'20 may 2025',rating:4},
 {id:14,name:'José Manuel Sánchez Ramírez',role:'Director académico de máster',company:'UNIR',tags:['Educación','IA','Tecnología'],place:'España',state:'Activo',initials:'JS',color:'#83b7b8',bio:'Especialista en tecnología educativa, metodologías activas e inteligencia artificial aplicada a la educación.',email:'',phone:'',joined:'14 may 2025',rating:4},
 {id:15,name:'Javier G. Recuenco',role:'CSO y fundador',company:'Singular Solving',tags:['Empresa','IA','Tecnología'],place:'España',state:'Activo',initials:'JR',color:'#c9ae87',bio:'Consultor de innovación, resolución de problemas complejos y pensamiento estratégico.',email:'',phone:'',joined:'21 apr 2026',rating:4},
 {id:16,name:'Hilario Manuel Blasco-Fontecilla',role:'Director general',company:'Emooti',tags:['Salud','Psicología','IA'],place:'España',state:'Activo',initials:'HB',color:'#d0a5d8',bio:'Investigador y clínico en salud mental, bienestar emocional e innovación aplicada.',email:'',phone:'',joined:'12 may 2026',rating:4},
 {id:17,name:'Iñaki Ortega',role:'Director general',company:'LlyC en Madrid',tags:['Empresa','Comunicación','IA'],place:'España',state:'Activo',initials:'IO',color:'#d9be78',bio:'Directivo y autor especializado en liderazgo, innovación y transformación.',email:'',phone:'',joined:'17 oct 2025',rating:4},
 {id:18,name:'Alberto Pascual',role:'Executive Director',company:'Ingram Micro · ASLAN',tags:['Empresa','Tecnología','Marketing'],place:'España',state:'Activo',initials:'AP',color:'#cdb57e',bio:'Directivo del sector tecnológico, especializado en innovación y negocio digital.',email:'',phone:'',joined:'30 oct 2025',rating:4},
 {id:19,name:'Santos Pardos Gotor',role:'Arquitecto de soluciones Cloud e instructor AWS autorizado',company:'UNIR · AWS',tags:['IA','Tecnología'],place:'España',state:'Activo',initials:'SP',color:'#90bdd0',bio:'Especialista en arquitectura de sistemas, cloud computing e ingeniería de software; experiencia en arquitecturas distribuidas, serverless, contenedores, Kubernetes y DevOps.',email:'',phone:'',joined:'29 sep 2026',photoUrl:'https://www.unir.net/wp-content/uploads/claustro/santos-pardos-gotor-4741496.jpg',rating:4,internalNote:'Ponente verificado en la landing oficial del Foro UNIR sobre IA aplicada al ciclo completo del desarrollo de software.'},
 {id:20,name:'Ángel Gálvez Caballero',role:'CISO',company:'Avolta',tags:['IA','Tecnología'],place:'España',state:'Activo',initials:'AG',color:'#a4bdd4',bio:'Especialista en ciberseguridad, gestión de riesgos y protección de infraestructuras críticas; lidera la estrategia global de seguridad de la información en Avolta.',email:'',phone:'',joined:'29 sep 2026',photoUrl:'https://www.unir.net/wp-content/uploads/2026/09/angel-galvez-caballero.jpeg',rating:4,internalNote:'Ponente verificado en la landing oficial del Foro UNIR sobre IA aplicada al ciclo completo del desarrollo de software.'},
 {id:21,name:'Iván Sanz Prieto',role:'Senior Manager of Software Development for AI, Data & DevSecOps',company:'Lumen Technologies',tags:['IA','Tecnología'],place:'España',state:'Activo',initials:'IS',color:'#9bc8bb',bio:'Lidera equipos globales de plataformas de datos, IA, automatización y ciberseguridad. Doctor en Ciencias de la Computación y coordinador académico del Máster Universitario en Desarrollo y Operaciones (DevOps).',email:'',phone:'',joined:'29 sep 2026',photoUrl:'https://www.unir.net/wp-content/uploads/2026/09/ivan-sanz-prieto.jpeg',rating:4,internalNote:'Ponente verificado en la landing oficial del Foro UNIR sobre IA aplicada al ciclo completo del desarrollo de software.'},
 {id:22,name:'Fiorella Piriz Sapio',role:'Solutions Architect',company:'Amazon Web Services',tags:['IA','Tecnología'],place:'España',state:'Activo',initials:'FP',color:'#d5b57e',bio:'Ingeniera bioinformática, con másteres en Desarrollo de Aplicaciones y Ciencia de Datos. Trabajó como Software Engineer y Data Scientist antes de AWS; su foco actual es la IA aplicada al desarrollo de software.',email:'',phone:'',joined:'29 sep 2026',photoUrl:'https://www.unir.net/wp-content/uploads/2026/09/fiorella.png',rating:4,internalNote:'Ponente verificado en la landing oficial del Foro UNIR sobre IA aplicada al ciclo completo del desarrollo de software.'},
 {id:23,name:'Olaia Gutiérrez',role:'Profesora del Máster Universitario en Neuropsicología y Educación',company:'UNIR',tags:['Educación','Psicología'],place:'España',state:'Activo',initials:'OG',color:'#8fb9ce',bio:'Pedagoga, neuropsicóloga educativa y orientadora. Especialista en altas capacidades y dificultades de aprendizaje, con experiencia en intervención, formación docente e innovación educativa con IA.',email:'',phone:'',joined:'30 sep 2026',internalNote:'Ponente verificada en la ficha oficial del Foro UNIR sobre aprendizaje, motivación y altas capacidades.'},
 {id:24,name:'Miguel Lois Mosquera',role:'Doctor en Psicología especializado en autismo y neurodiversidad',company:'Especialista independiente',tags:['Psicología','Educación'],place:'España',state:'Activo',initials:'ML',color:'#cab1d8',bio:'Doctor en Psicología especializado en autismo y neurodiversidad. Autor de “La Neurodiversidad en la práctica: autismo y educación”, con experiencia en pedagogías activas y desarrollo socioemocional.',email:'',phone:'',joined:'30 sep 2026',internalNote:'Ponente verificado en la ficha oficial del Foro UNIR sobre aprendizaje, motivación y altas capacidades.'},
 {id:25,name:'Elena Alarcón Orozco',role:'Doctora en Psicología y docente',company:'UNIR',tags:['Psicología','Educación'],place:'España',state:'Activo',initials:'EA',color:'#d7a1bd',bio:'Doctora en Psicología por la Universidad de Málaga y acreditada por ANECA como Profesora Contratada Doctora; experiencia docente e investigadora en el ámbito universitario, público y privado.',email:'',phone:'',joined:'30 sep 2026',internalNote:'Ponente verificada en la ficha oficial del Foro UNIR sobre aprendizaje, motivación y altas capacidades.'},
 {id:38,name:'Elena del Pilar Jiménez Pérez',role:'Especialista en comprensión lectora, lectura, escritura y tecnología educativa',company:'Asociación Española de Comprensión Lectora',tags:['Educación','Tecnología','IA'],place:'España',state:'Activo',initials:'EJ',color:'#9fcfe5',bio:'Presidenta de la Asociación Española de Comprensión Lectora, entidad que fundó en 2012, y directora de la revista científica Investigaciones Sobre Lectura.',email:'',phone:'',joined:'8 oct 2026',photoUrl:'https://www.unir.net/wp-content/uploads/2026/09/Elena-del-Pilar-jimenez.png',internalNote:'Ficha creada desde el programa oficial del Foro UNIR sobre el informe PISA.'},
 {id:39,name:'Arantxa Basterra González',role:'Doctora en Educación y Sociedad del Conocimiento, docente universitaria',company:'Docente universitaria',tags:['Educación','Tecnología','Psicología'],place:'España',state:'Activo',initials:'AB',color:'#b6d6ec',bio:'Investigadora especializada en bienestar digital, uso problemático de la tecnología y riesgos digitales en población infantojuvenil. Participa en el Observatorio Nacional de Educación Digital y Mujeres Líderes en Educación.',email:'',phone:'',joined:'8 oct 2026',photoUrl:'https://www.unir.net/wp-content/uploads/2026/09/Aranzazu-Basterra.jpg',internalNote:'Ficha creada desde el programa oficial del Foro UNIR sobre el informe PISA.'},
 {id:40,name:'Àngels Soriano Sánchez',role:'Coordinadora académica del Experto en IA en Educación',company:'UNIR',tags:['Educación','IA','Tecnología'],place:'España',state:'Activo',initials:'AS',color:'#a8d9ee',bio:'Especializada en inteligencia artificial, tecnología educativa y ética digital. Acompaña al profesorado en la transformación de las aulas desde la reflexión, la innovación y la conciencia.',email:'',phone:'',joined:'8 oct 2026',photoUrl:'https://www.unir.net/wp-content/uploads/2026/09/angels-soriano-sanchez.jpg',internalNote:'Ficha creada desde el programa oficial del Foro UNIR sobre el informe PISA.'},
 {id:41,name:'Adrián Suárez Mouriño',role:'Director de Estrategia del Área de Diseño',company:'UNIR',tags:['Diseño','Animación','Videojuegos','IA','Tecnología'],place:'España',state:'Activo',initials:'AS',color:'#8fcbe5',bio:'Especialista en diseño digital, animación y videojuegos. Dirige la estrategia del Área de Diseño de UNIR y trabaja sobre el uso de inteligencia artificial generativa en procesos creativos, producción audiovisual y formación de nuevos perfiles profesionales.',email:'',phone:'',joined:'25 sep 2025',internalNote:'Ponente verificado en Foro UNIR sobre IA para diseño y animación. Abordó IA generativa, creatividad, animación, industria audiovisual, videojuegos y empleabilidad.'},
 {id:42,name:'Roi Iturregui',role:'Artista, animador freelance y coordinador del Grado en Animación 2D y 3D',company:'UNIR',tags:['Diseño','Animación','Videojuegos','IA','Audiovisual'],place:'España',state:'Activo',initials:'RI',color:'#a6d7e8',bio:'Artista y animador especializado en animación 2D y 3D, narrativa visual, creación de personajes y producción digital. Investiga el uso de IA generativa para moodboards, storyboards, diseño de assets y procesos de animación.',email:'',phone:'',joined:'25 sep 2025',internalNote:'Ponente verificado en Foro UNIR sobre IA para diseño y animación. Demostró aplicaciones prácticas de IA en preproducción, imágenes, recorte y animación.'}
 ,{id:26,name:'José Antonio Luengo',role:'Psicólogo y vicepresidente primero',company:'Consejo General de la Psicología de España',tags:['Psicología','Educación'],place:'España',state:'Pendiente',initials:'JL',color:'#a9c9d8',bio:'Catedrático de Enseñanza Secundaria en Orientación Educativa y coordinador del Equipo de Apoyo Socioemocional de la Unidad de Convivencia y Contra el Acoso Escolar de la Comunidad de Madrid.',email:'',phone:'',joined:'21 sep 2026',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:27,name:'Desiré Sánchez Chiva',role:'Psicóloga y directora de máster',company:'UNIR',tags:['Psicología','Educación'],place:'España',state:'Pendiente',initials:'DS',color:'#d9a5bd',bio:'Psicóloga y directora del Máster Universitario de Intervención Psicológica en el Ámbito Educativo de UNIR. Cuenta con formación especializada en intervención y mediación familiar.',email:'',phone:'',joined:'21 sep 2026',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:28,name:'Beatriz Martínez Núñez',role:'Médico Psiquiatra Infantil y de la Adolescencia',company:'Hospital Infantil Universitario Niño Jesús',tags:['Salud','Psicología'],place:'España',state:'Pendiente',initials:'BM',color:'#d5a4d9',bio:'Coordinadora del Hospital de Día de Adolescentes del Hospital Infantil Universitario Niño Jesús de Madrid y autora de “Manual de supervivencia para padres en la era digital”.',email:'',phone:'',joined:'21 sep 2026',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:29,name:'Anselmo Ruiz de Alarcón',role:'Analista de datos',company:'Selección masculina de fútbol de Estados Unidos',tags:['IA','Tecnología','Salud'],place:'Estados Unidos',state:'Pendiente',initials:'AR',color:'#91bdd2',bio:'Especialista en análisis de datos aplicado al fútbol de élite, con experiencia en Chelsea FC, Athletic Club, Real Betis, Jönköpings Södra y proyectos internacionales de evaluación de clubes.',email:'',phone:'',joined:'22 sep 2026',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:30,name:'Moisés Falces',role:'Doctor en Ciencias de la Actividad Física y del Deporte',company:'Especialista en alto rendimiento en fútbol',tags:['Salud','Tecnología'],place:'España',state:'Pendiente',initials:'MF',color:'#9bc8bb',bio:'Preparador físico, profesor e investigador con experiencia en fútbol profesional y alto rendimiento. Su trabajo se centra en la monitorización de cargas, el rendimiento y el riesgo de lesión.',email:'',phone:'',joined:'22 sep 2026',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:31,name:'Ignacio Vázquez Cabrera',role:'Technical Analyst',company:'SkillCorner',tags:['IA','Tecnología'],place:'España',state:'Pendiente',initials:'IV',color:'#8fb9ce',bio:'Especialista en analítica de datos aplicada al fútbol. Desarrolla métricas a partir de datos de tracking y traduce necesidades deportivas a requisitos para modelos de IA.',email:'',phone:'',joined:'22 sep 2026',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:32,name:'Pedro Díaz García',role:'Responsable de proyectos de I+D en IA aplicada a ciberseguridad',company:'INTA · Ministerio de Defensa',tags:['IA','Tecnología'],place:'España',state:'Pendiente',initials:'PD',color:'#9ab8d7',bio:'Especialista en TIC y ciberseguridad. Ha desarrollado responsabilidades ligadas a este ámbito en diferentes unidades y organismos tras su paso por el Ejército del Aire y del Espacio.',email:'',phone:'',joined:'24 sep 2026',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:33,name:'Luis Alejandro Velásquez Hurtado',role:'Experto en Ciberdefensa e Inteligencia Estratégica',company:'Especialista independiente',tags:['Tecnología','Gobierno'],place:'Por completar',state:'Pendiente',initials:'LV',color:'#b7cedd',bio:'Ingeniero Naval Electrónico con experiencia en inteligencia, contrainteligencia, ciberseguridad, ciberdefensa y seguridad naval militar. Ha ejercido como analista de Inteligencia Estratégica y docente.',email:'',phone:'',joined:'24 sep 2026',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:34,name:'José Baena Cobos',role:'Security Platform Engineer y profesor de IA aplicada a la Ciberseguridad',company:'Dentsu',tags:['IA','Tecnología'],place:'España',state:'Pendiente',initials:'JB',color:'#a4bdd4',bio:'Ingeniero Informático. Desarrolla sistemas de IA para análisis de malware y detección de intrusiones; su trayectoria incluye investigación de amenazas, purple teaming y seguridad de contenedores.',email:'',phone:'',joined:'24 sep 2026',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:35,name:'Mª Teresa Kaiser Manzano',role:'Coordinadora académica del Máster Universitario en Microbiota Humana',company:'UNIR',tags:['Salud','Ciencia','Microbiota'],place:'España',state:'Pendiente',initials:'TK',color:'#c6b5dc',bio:'Doctora por la Universidad de Salamanca, licenciada en Farmacia y Bioquímica y graduada en Nutrición Humana y Dietética. Ponente en el Foro UNIR sobre microbiota y rendimiento deportivo.',email:'',phone:'',joined:'28 sep 2026',photoUrl:'https://www.unir.net/wp-content/uploads/claustro/m-teresa-kaiser-manzano-4218.jpg',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:36,name:'Juan Francisco Romero Collazos',role:'Coordinador académico del Máster Universitario en Estrategias Nutricionales en la Práctica Deportiva',company:'UNIR',tags:['Salud','Ciencia','Microbiota'],place:'España',state:'Pendiente',initials:'JR',color:'#b7d6a8',bio:'Doctor en Biología y graduado en Nutrición con mención en Ejercicio Físico y Entrenamiento. Investigador de EPINUT-UCM y experto en valoración, intervención y monitorización nutricional. Ponente en el Foro UNIR sobre microbiota y rendimiento deportivo.',email:'',phone:'',joined:'28 sep 2026',photoUrl:'https://www.unir.net/wp-content/uploads/claustro/juan-francisco-romero-collazos-5912830.jpg',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:37,name:'Carmen González Vásquez',role:'Directora del Área de Nutrición y Deporte',company:'UNIR',tags:['Salud','Ciencia','Microbiota'],place:'España',state:'Pendiente',initials:'CG',color:'#c9dcec',bio:'Doctora en Farmacia, graduada en Farmacia y Nutrición por la Universidad de Navarra. Es farmacéutica comunitaria y docente del Grado en Nutrición Humana y Dietética. Ponente en el Foro UNIR sobre microbiota y rendimiento deportivo.',email:'',phone:'',joined:'28 sep 2026',photoUrl:'https://www.unir.net/wp-content/uploads/claustro/maria-del-carmen-gonzalez-vazquez-5022142.jpg',internalNote:'Perfil completado desde la ficha oficial del Foro UNIR. Pendiente de valoración interna.'}
 ,{id:43,name:'Edwin Fernández Cruz',role:'Director del Área de Nutrición',company:'UNIR',tags:['Salud','Nutrición','Microbiota'],place:'España',state:'Pendiente',initials:'EF',color:'#b8d3c1',bio:'Director del Área de Nutrición de UNIR. Participó en el Foro UNIR sobre microbiota, metabolismo, inmunidad y salud mental.',email:'',phone:'',joined:'29 sep 2025',internalNote:'Participación verificada en la crónica oficial de UNIR. Pendiente de valoración interna.'}
 ,{id:44,name:'Amanda Cuevas Sierra',role:'Investigadora postdoctoral',company:'Instituto IMDEA Alimentación · IBDEAFUD',tags:['Salud','Nutrición','Microbiota','Investigación'],place:'España',state:'Pendiente',initials:'AC',color:'#e2bdcf',bio:'Investigadora postdoctoral vinculada al Instituto IMDEA Alimentación y al grupo IBDEAFUD. Participó en el Foro UNIR sobre microbiota, metabolismo, inmunidad y salud mental.',email:'',phone:'',joined:'29 sep 2025',internalNote:'Participación verificada en la crónica oficial de UNIR. Pendiente de valoración interna.'}
 ,{id:45,name:'Víctor de la O Pascual',role:'Investigador postdoctoral',company:'Instituto IMDEA Alimentación · IBDEAFUD',tags:['Salud','Nutrición','Microbiota','Investigación','IA'],place:'España',state:'Pendiente',initials:'VP',color:'#b5cce2',bio:'Investigador postdoctoral vinculado al Instituto IMDEA Alimentación y al grupo IBDEAFUD. Expuso aplicaciones de bioinformática e IA en nutrición personalizada durante el Foro UNIR sobre microbiota.',email:'',phone:'',joined:'29 sep 2025',internalNote:'Participación verificada en la crónica oficial de UNIR. Pendiente de valoración interna.'}
 ,{id:46,name:'Alberto Conejero',role:'Dramaturgo, guionista y poeta español',company:'Profesional independiente',tags:['Cultura','Humanidades','Literatura','Cine'],place:'España',state:'Pendiente',initials:'AC',color:'#cf9d76',bio:'Dramaturgo, guionista y poeta español. Premio Nacional de Literatura Dramática en 2019 y premio Max a mejor creación original en 2016 por «La piedra oscura».',email:'',phone:'',joined:'13 oct 2026',photoUrl:'https://www.unir.net/wp-content/uploads/2026/09/130_Alberto_Conejero-1.jpg',internalNote:'Participación y fotografía verificadas en la ficha oficial de Foro UNIR. Pendiente de valoración interna.'}
 ,{id:47,name:'Estefanía Cabello',role:'Escritora, gestora cultural y profesora universitaria',company:'UNIR',tags:['Cultura','Humanidades','Literatura'],place:'España',state:'Pendiente',initials:'EC',color:'#d6aac4',bio:'Doctora en Literatura Española y especialista en literatura de los siglos XIX y XX. Ha recibido reconocimientos como investigadora y creadora.',email:'',phone:'',joined:'13 oct 2026',photoUrl:'https://www.unir.net/wp-content/uploads/2026/09/estefania-cabello-rosa.jpg',internalNote:'Participación y fotografía verificadas en la ficha oficial de Foro UNIR. Pendiente de valoración interna.'}
 ,{id:48,name:'Miguel Carrera',role:'Coordinador del Área de Literatura de La Madraza',company:'La Madraza · Cátedra García Lorca',tags:['Cultura','Humanidades','Literatura'],place:'España',state:'Pendiente',initials:'MC',color:'#90b4c7',bio:'Director de la Cátedra García Lorca. Imparte, entre otras, las asignaturas «Federico García Lorca y La Generación del 27» y «El discurso literario español en la actualidad».',email:'',phone:'',joined:'13 oct 2026',photoUrl:'https://www.unir.net/wp-content/uploads/2026/09/miguel_carrera.jpeg',internalNote:'Participación y fotografía verificadas en la ficha oficial de Foro UNIR. Pendiente de valoración interna.'}
];
const importedDirectoryNames = `Édgar Guillermo Solano
Sara Muñoz Cadena
Luis Gabriel Degiovanni
Libia Rivas Ordoñez
Enrique Zapata Pérez
Giovanna Miranda Chacón
Nathalie Vélez Ponce
Walter Cabanillas
Edwin Santos Esparza
Rosa María Romero Zúñiga
Enric Armengou Orus
Daniel Vega Moreno
Mauricio Reyes Ariza
Ana María Ulloa Martínez
Augusto Ruiz
Juan Carlos Beltrán Rebaza
Víctor Solano Franco
Mariana Bermúdez
Soledad Misa
Celene Baena Franco
Ana Lucía Castillo
Ignacio Melero Miguel
Diego Cubas
Walter Vega
Érika María Rodríguez
Hector Schamis
Eduardo Saldaña Lisedas
Sonia Alda Mejías
Sergio Castaño Riaño
Porfirio Rodríguez
Ana Álvarez Simón
Simón Borrero
Luis Alberto Villegas
Mireya Fernández Merino
Alberto de Lucas Vicente
Belén Martín Guerrero
Rosa María Moreno Medrano
Paloma del Carmen Zea
María Emma Zapata Espinosa
José Antonio Errazuriz
Fernando Muñoz
Juan Esteban Zuleta
Alfonso García Martín
Daniel Franco
Adrián Rego Fernández
Adrián Suárez
Carmelo Marcén Albero
Susana Revuelta Uzábal
Laura Benitez
Laura Magalhães Andrade
Ruben Vera Gómez
Adriana Arciniega
Nelson Shack
María Consuelo Bussalleu
Mario Maldonado Smith
Mario Homero Maldonado Mundo
Alfredo Abadías
Emma Fernández
Alberto Pascual
Iñaki Ortega Cachón
Ángel Andreu Escario
Judit Iriondo Álvarez
Maite Hernández
Mar Abad
Ricardo Villa Asensi
Jon Sedano
Brenda Vásquez de la Hoz
Adolfo Blanco
Lucía Tello
Cristina Teva
Elena Neira
Lorena Tapia Núñez
Estuardo Salvador
Gina Gómez de la Torre
Yaisa Córdoba Zabala
Tamara Martínez Soto
Angie Dejaneira Barros Espinoza
Dra. Luz Elena Narváez Hernández
Miriam Fernández Férez
Alberto del Castillo Román
Patricia Rayón Villela
María Luisa Girón Vargas
Silvia Wobbeking Sánchez
Humberto Villa Cortés
Ascensión Blanco
Dr. Ramón Rosaleny Castell
David Turró
Alberto Fernández Vidal
Mar Rodríguez Brioso
Juan Gonzalo Ospina Serrano
Javier González Gutiérrez
Daniel Márquez Lasso
Carlos García Junco
Mari Paz Santos Zúñiga
María Oñez Martín Montalvo
Carlota Pérez Sancho
Analía Barbón
Roi Iturregui
Vicealmirante Francisco Javier Roca Rivero
José Cepeda
Manuel Sánchez Rubio
Diego Antonio Restrepo Miranda
Susana Blanco Migueles
Matilde Vera Rodríguez
Luis Sarrato
Ivan Ochsenius
Giancarlo Retamozo
Pablo López
José Manuel Velasco Guardado
Antonio Ramos Arroyo
Leonardo Larrea Velasco
Lola Arranz
María Fernanda Trigo
Silverio Zebral Filho
José Luis Ros-Medina
Helena Fonseca
Mike Mora
Rebecca Omaña
Betty Arévalo
Iván Ochsenius
Víctor Bonilla Ortega
Víctor Pascual Planchuelo
Gema Lorente Martín
Carlos Lara Aguilar
Daniel Carofilis Hernández
Fernando de la Cruz Prego
José Gabriel Aguilera Maldonado
José Manuel Sánchez Ramírez
Gustavo Mizraim González
Neil Patel
Alba López Bolás
Carlos Estrada Fonseca
Felipe Puerta
Valeria Sol Groisman
Mónica Muñoz
Consuelo Alcalá
Gabriela Paiz
Blanca Sicilia Almela
Benjamín Escalonilla
Anna Cacciola
José María Cepeda
Irene Araque Criado
Rafael Mazo Torres
David García Novis
Anabell Aguilera Tamayo
Javier Cuesta Godoy
Sandra Gil López
Franz Guzmán Galarza
Grether Lucía Real Pérez
Guillermo García González
Miguel Ángel Ballesteros Martín
Mariano Bartolomé
Amanda Cuevas Sierra
Edwin Fernández Cruz
Víctor de la O Pascual
José Eugenio Medina
Andrea Robles González
Nahikari Sánchez-Herrero
Norberto Cuartero Toledo
Elisabet Chorro
Jerónimo García Sánchez
Sara Moro
Virginia Calvo Gómez
Gabriel Drouet López
Paco Salcedo
Iñaki Ortega
Carmen Boullosa
Ana Vidal Egea
Oriette d’Ángelo
Beatriz Jiménez Villanueva
Víctor Gutiérrez Sanz
Carlos Salas Abusada
Gonzalo Teubal Rodríguez
Gemma Lorente Martín
Rodrigo Hormazábal Lama
Guiomar Garrido
Virginia Pascual López
Alicia Palacios Ortega
Álvaro Barreras Peral
Leonardo Larrea
Adolfo Ramírez Lavado
Ainhoa García Rivero
Anna Soler Bonet
Juliana Restrepo
Lucía Gallego Deike
Francisco Izuzquiza
Carolina Guerrero
Marta Rodríguez Martínez
Gabriele Vestri
Lorena Pérez García
Victor Bonilla Ortega
Helena Sánchez
Cristina Ferrer
Rubén Martín
Ernesto Tarragón Cros
Renato Cisneros
Pedro Jesús Plaza González
María del Mar Ramón Vélez
Mari Paz Santos
David Martínez
Grecia de Jesús Araujo
Silvia Arribas García
Rita Lara Gras
Gonzalo Toledano Rodríguez de la Pica
Juan Enrique Soto
Javier Cantón
Hilario Manuel Blasco-Fontecilla
Enrique Berra Ruiz
Martín Gómez Sánchez
Tamara Martínez
Guillermo Blanco Cenjor
Dr. Tomás J. Aliste Santos
Marta Carrión Páez
Silvia Moreno Portillo
Claudia Navascues Fernández
Diego Poblete Águila Pardo
Luisa Fernanda Morales
Santiago Mayorga Escalada
Edna Patricia López
Edwin Arturo Ruiz
Cristian Andrés Soto Moreno
José Luis Lapetra
Lorena Polo Navarro
Alberto Capella Garcés
Francisco Javier Vázquez
Andy Ferguson
Vicent Argudo Esteve
Emiliano Pozuelo de Gracia
Felipe Sánchez García
Iñigo Sanz Egurrola
Ricardo González Escobar
Abraham Isaac Vergara Contreras
Carmen Elisa Coronado
Jorge Muñoz Wells
Diana Álvarez-Calderón
Cecilia Bernuy
Jenny Pérez
Adrián Suárez Mourillo
Carlos Javier Pazmiño Brito
Santiago Amador Ruiz
Antonela Moniente Pannocchia
Úrsula Arlet Silva
Joaquín González Cabrera
Antonio Rial Boubeta
Carlos Vives
David Gamella
Aurora Jechimer
Elena Merino Rivera
Julia García Doncel
Ana Yépez Peñalver
José Manuel Sendín
Inés Alarcón
Alberto José Montezuma Chirinos
Iván Alexander Casiano Lossio, MCIArb
Roxana Jiménez Vargas-Machuca
Angélica Partida-Hanon
Luis Miguel Garay
Oscar Fernández Mora
Andrea Borja Vásquez
Jorge Panimbosa
Pedro Robledo
Jaime Humberto Moreno
Samanta Hurtado
Alejandra Barreiro
Angélica Agudelo Ortiz
Carlos Augusto Chacón
Jairo Libreros
Claudia Rodríguez
José Ruiz Pardo
Mario García Gurrionero
Mª del Mar Soria
Ander Serrano
Iñaki Rodríguez Galván
Jesús Delgado Valery
José Manuel Villalobos
Víctor Pascual
Lizeth Hermosa Flores
Hendrys Fabián Tobar, PhD
Mirna Zárate Hernández
Nahikari Sánchez Herrero
Diego Cardozo
Andrés Ferraro Sastre
Débora Nuevo Ejeda
Natalia Rumbero Sánchez
Daniela Narváez
Alicia Martínez de la Muela
Ainhoa Arana Cuenca
Javier G. Recuenco
Liliana Acosta Arias
Manuel Pineda Serrano
Fabián Hurtado
Jorge Cedeño
Pamela Ruiz Castañeda
Jerónima Sandino Ceballos
Celeste Guadalupe Salerno
José Luis Fernández Santillana
Cristina Rodríguez-Porrero Miret
María Luisa Forniés Arranz
Noemí Yuste Blázquez
Alejandro González Andrade
Beatriz Eugenia González Hernández
Javier Recuenco
Minerva Navarrete
Patricia María Tisner
Hilario Manuel Blasco Fontecilla
Sandra Doval Moreno
Eduardo González Fraile
José Luis Ros
Esteban Torres Cobo
Sara Maridueña Orellana
José Manuel Sánchez
Otto René Granados Roldán
Martha Yamel Gálvez
Josetxo Pérez Apestegui
Ileana Pérez Vergara
David Ciprés Bagüeste
Fernando De la Cruz Prego
David Jara
Manuel Sánchez Moreno
Nicolas Zevallos Trigoso
María Contreras Román
Jorge Ruvalcaba
Gema Atienza Toledo
Daniel Escobar Sáez
Marta Corral-Martínez
Pamela Foelsch
Helen Cristina Trebbau López
Ana Sánchez Presyler`.split('\n');
const normalizeDirectoryName=(name:string)=>name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
const importedPeople:Person[]=importedDirectoryNames.filter(name=>!people.some(person=>normalizeDirectoryName(person.name)===normalizeDirectoryName(name))).map((name,index)=>({id:1000+index,name,role:'Perfil importado desde BBDD Ponentes',company:'Pendiente de clasificar',tags:[],place:'Por completar',state:'Pendiente',initials:name.split(' ').filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase(),color:['#c9dcec','#f1d3bf','#d5e5c8','#ead0db','#ddd4ed'][index%5],bio:'Registro importado de la hoja BBDD Ponentes. Pendiente de completar perfil, contacto y especialidades.',email:'',phone:'',joined:'Importado desde BBDD',internalNote:'Pendiente de revisar y enriquecer desde la ficha original.'}));
const directoryPeople=[...people,...importedPeople];
const candidates = [
 {name:'Mauricio Reyes Ariza',role:'CEO',company:'Inventta Colombia, Perú y México',tags:['Empresa','IA','Educación'],source:'Hoja: no alcanzaron',state:'Revisando',initials:'MR',color:'#d6b87b',bio:'Ingeniero industrial y empresario con experiencia en innovación, investigación y desarrollo.',internalNote:'No alcanzó a participar por falta de cupo. Se considera una conexión clave por su experiencia en innovación y desarrollo empresarial.'},
 {name:'Ana María Ulloa Martínez',role:'Jefa de Calidad',company:'Hospital Méderi',tags:['Salud','Educación','Empresa'],source:'Hoja: no alcanzaron',state:'Revisando',initials:'AU',color:'#d9a5bd',bio:'Responsable de calidad hospitalaria y sistemas integrados de gestión.',internalNote:'No hubo cupo para el foro previsto el 11 de marzo.'},
 {name:'Augusto Ruiz',role:'Consultor independiente',company:'Innovación, negocios y finanzas',tags:['Empresa','Tecnología'],source:'Hoja: no alcanzaron',state:'Nuevo',initials:'AR',color:'#c9b386',bio:'Consultor en innovación empresarial, negocios y finanzas.',internalNote:'Su agenda no le permitió participar. Figura como superrecomendado para contenidos de videojuegos y tecnología gamer.'},
 {name:'Juan Carlos Beltrán Rebaza',role:'Strategic Marketing · Medical Affairs · Market Access',company:'Industria farmacéutica',tags:['Empresa','Tecnología'],source:'Hoja: no alcanzaron',state:'Nuevo',initials:'JB',color:'#a8bdd7',bio:'Líder comercial estratégico con experiencia en estrategia de industria farmacéutica, licencias y acceso a mercado.',internalNote:'Perfil disponible para futuros foros sobre estrategia empresarial, innovación e industria.'},
 {name:'Sebastián Saavedra Martínez',role:'Director de Emprendimiento',company:'INNPulsa Colombia',tags:['Gobierno','Empresa','IA'],source:'Hoja: no alcanzaron',state:'Revisando',initials:'SS',color:'#98c484',bio:'Responsable de emprendimiento e innovación pública.',internalNote:'No pudo comprometer fecha y hora para el foro.'},
 {name:'Mónica Fonseca',role:'Building Human, Smart and Sustainable Cities',company:'Top Voice',tags:['Gobierno','IA','Empresa'],source:'Hoja: no alcanzaron',state:'Nuevo',initials:'MF',color:'#c9a37b',bio:'Especialista en ciudades inteligentes, sostenibilidad e innovación.',internalNote:'No hubo cupo para el foro del 19 de marzo.'},
 {name:'Mónica María Fonseca',role:'Líder de la Consejería Distrital de TIC',company:'Alcaldía de Bogotá',tags:['Gobierno','IA','Tecnología'],source:'Hoja: no alcanzaron',state:'Nuevo',initials:'MM',color:'#8dbfd2',bio:'Responsable de tecnología e innovación pública en la Alcaldía de Bogotá.',internalNote:'No hubo cupo para el foro del 19 de marzo.'},
 {name:'Ana Carolina Escobar Barrera',role:'Consultora de transformación digital',company:'Alcaldía de Bogotá',tags:['Gobierno','IA','Tecnología'],source:'Hoja: no alcanzaron',state:'Nuevo',initials:'AE',color:'#a2c9d4',bio:'Consultora de transformación digital y datos abiertos.',internalNote:'No hubo cupo para el foro del 19 de marzo.'}
];
const presenters={
 'Ana Gugel':{name:'Ana Gugel',role:'Presentadora Foro UNIR',initials:'AG',color:'#d9a5bd',photoUrl:'https://img.rtve.es/i/?crop=no&i=1454320803757.jpg&o=no&w=1000'},
 'Jorge Heili':{name:'Jorge Heili',role:'Presentador Foro UNIR',initials:'JH',color:'#8fb9ce'},
 'Alfredo Peña':{name:'Alfredo Peña',role:'Presentador Foro UNIR',initials:'AP',color:'#d7bc7e'}
} as const;
const forums: Forum[] = [
 {name:'Aula 4.0: cómo transformar la educación en el Perú',date:'29 mayo 2025',theme:'Educación',people:['Edgar Guillermo Solano'],youtubeUrl:'https://www.youtube.com/watch?v=iCqNN5iAsqs',previewImage:'https://i.ytimg.com/vi/iCqNN5iAsqs/hqdefault.jpg'},
 {name:'La inteligencia artificial en la Administración Pública',date:'4 marzo 2025',theme:'IA',people:['Sara Muñoz Cadena','Luis Gabriel Degiovanni','Libia Rivas Ordóñez','Enrique Zapata Pérez'],sourceUrl:'https://colombia.unir.net/actualidad-unir/ia-revoluciona-administracion-publica-america-latina-desafios-y-oportunidades-foro-unir/',sourceLabel:'Crónica oficial UNIR',youtubeUrl:'https://www.youtube.com/watch?v=ETZ4uHdBVfY',previewImage:'https://colombia.unir.net/wp-content/uploads/sites/4/2025/04/Captura-de-pantalla-553-1-1-1-final.jpg'},
 {name:'MBA: Emprendimiento y Tecnología · IA para el negocio',date:'19 marzo 2025',theme:'Empresa',people:['Nathalie Vélez Ponce','Walter Cabanillas','Edwin Santos Esparza'],youtubeUrl:'https://www.youtube.com/watch?v=2CljdoLrZcw',previewImage:'https://i.ytimg.com/vi/2CljdoLrZcw/hqdefault.jpg'},
 {name:'Terapias de tercera generación: conductas autolesivas',date:'4 marzo 2025',theme:'Salud',people:['Enric Armengou Orús','Daniel Vega Moreno'],youtubeUrl:'https://www.youtube.com/watch?v=LJW9OrvafvQ&t=203s',previewImage:'https://i.ytimg.com/vi/LJW9OrvafvQ/hqdefault.jpg'},
 {name:'El algoritmo del miedo: prevención del acoso escolar',date:'21 septiembre 2026',theme:'Salud',people:['José Antonio Luengo','Desiré Sánchez Chiva','Beatriz Martínez Núñez'],sourceUrl:'https://www.unir.net/evento/foros/foro-prevencion-acoso-escolar/',sourceLabel:'Ficha oficial UNIR'},
 {name:'Qué está haciendo la IA en el deporte: datos para tomar decisiones',date:'22 septiembre 2026',theme:'IA',people:['Anselmo Ruiz de Alarcón','Moisés Falces','Ignacio Vázquez Cabrera'],sourceUrl:'https://www.unir.net/evento/foros/foro-ia-deporte/',sourceLabel:'Ficha oficial UNIR'},
 {name:'Ciberseguridad: amenazas y desafíos para empresas y ciudadanos en 2026',date:'24 septiembre 2026',theme:'Tecnología',people:['Pedro Díaz García','Luis Alejandro Velásquez Hurtado','José Baena Cobos'],sourceUrl:'https://www.unir.net/evento/foros/foro-ciberseguridad-amenazas/',sourceLabel:'Ficha oficial UNIR'},
 {name:'Cómo impacta la microbiota en la mejora del rendimiento deportivo',date:'28 septiembre 2026',theme:'Salud',people:['Mª Teresa Kaiser Manzano','Juan Francisco Romero Collazos','Carmen González Vásquez'],sourceUrl:'https://www.unir.net/evento/foros/foro-microbiota-deporte/',sourceLabel:'Ficha oficial UNIR',recentEmission:true},
 {name:'La microbiota es metabolismo, inmunidad y salud mental',date:'29 septiembre 2025',theme:'Salud',people:['Edwin Fernández Cruz','Amanda Cuevas Sierra','Víctor de la O Pascual'],presenter:'Ana Gugel',sourceUrl:'https://www.unir.net/revista/salud/foro-microbiota-metabolismo-inmunidad-salud-mental/',sourceLabel:'Crónica oficial UNIR · participantes y contenidos',previewImage:'https://www.unir.net/wp-content/uploads/2025/10/Captura-de-pantalla-2025-10-03-123541-1.jpg',summary:'Foro UNIR sobre microbiota, metabolismo, inmunidad, salud mental y nutrición personalizada, con aplicaciones de bioinformática e inteligencia artificial.',program:['Microbiota, metabolismo, inmunidad y salud mental','Bioinformática e IA para nutrición personalizada']},
 {name:'IA aplicada al ciclo completo del desarrollo de software',date:'29 septiembre 2026',theme:'IA',people:['Santos Pardos Gotor','Ángel Gálvez Caballero','Iván Sanz Prieto','Fiorella Piriz Sapio'],sourceUrl:'https://www.unir.net/evento/foros/foro-ia-software/',sourceLabel:'Ficha oficial UNIR',youtubeUrl:'https://www.youtube.com/watch?v=-vjnQoLAlBg',previewImage:'https://i.ytimg.com/vi/-vjnQoLAlBg/hqdefault.jpg',recentEmission:true},
 {name:'Aprendizaje y motivación: cómo acompañar a estudiantes con altas capacidades',date:'30 septiembre 2026',theme:'Educación',people:['Olaia Gutiérrez','Miguel Lois Mosquera','Elena Alarcón Orozco'],presenter:'Ana Gugel',sourceUrl:'https://www.unir.net/evento/foros/foro-altas-capacidades/',sourceLabel:'Ficha oficial UNIR · grabación y programa'},
 {name:'IA para diseño y animación: cómo agilizar procesos creativos',date:'25 septiembre 2025',theme:'Diseño',people:['Adrián Suárez Mouriño','Roi Iturregui'],presenter:'Ana Gugel',sourceUrl:'https://www.unir.net/revista/diseno/foro-animacion-agilizar-procesos/',sourceLabel:'Crónica oficial UNIR · programa y ponentes',summary:'Taller práctico sobre IA generativa aplicada al diseño, animación, narrativa visual, creación de personajes, moodboards, storyboards y videojuegos.',program:['Herramientas de IA para agilizar diseño, animación y producción audiovisual','Nuevos perfiles profesionales y oportunidades en la industria de videojuegos y contenidos interactivos']},
 {name:'Taller práctico: cómo usar la IA para automatizar parte de tu trabajo',date:'5 octubre 2026',theme:'IA',people:[],sourceUrl:'https://www.unir.net/evento/foros/foro-ia-automatizar-tareas/',sourceLabel:'Ficha oficial UNIR'},
 {name:'Informe PISA: ideas para mejorar el aprendizaje desde el aula',date:'8 octubre 2026',startsAt:'17:00',endsAt:'18:00',theme:'Educación',people:['Elena del Pilar Jiménez Pérez','Arantxa Basterra González','Àngels Soriano Sánchez'],sourceUrl:'https://www.unir.net/evento/foros/foro-informe-pisa/',sourceLabel:'Ficha oficial UNIR · programa y ponentes',previewImage:'https://www.unir.net/wp-content/uploads/2026/05/ForoEDUCACION_UNIRNET-PRE_1920x1080-1.jpg',summary:'El foro analiza qué hay detrás de los resultados PISA: comprensión, razonamiento, atención, hábitos de aprendizaje, tecnología e IA; y propone estrategias aplicables desde el aula.',program:['La tecnología como mediadora de la competencia lectora: de la IA a los informes PIRLS y PISA','Mesa redonda sobre retos y soluciones para mejorar el aprendizaje desde el aula']},
 {name:'García Lorca en el cine: nuevos enfoques para interpretar al gran escritor',date:'13 octubre 2026',startsAt:'17:00',endsAt:'18:00',theme:'Cultura',people:['Alberto Conejero','Estefanía Cabello','Miguel Carrera'],sourceUrl:'https://www.unir.net/evento/foros/foro-garcia-lorca/',sourceLabel:'Ficha oficial UNIR · programa y ponentes',summary:'Una conversación sobre la relación entre literatura y cine, la adaptación y la reinterpretación de la obra de Federico García Lorca a partir de «La bola negra».',program:['17:00 · García Lorca en el cine: nuevos enfoques para interpretar al gran escritor · Alberto Conejero','17:20 · Mesa redonda · Alberto Conejero, Estefanía Cabello y Miguel Carrera']},
 {name:'El desafío del bienestar: cómo construimos la salud mental',date:'14 octubre 2026',theme:'Salud',people:[],sourceUrl:'https://www.unir.net/evento/foros/foro-salud-mental/',sourceLabel:'Ficha oficial UNIR'}
];
// Solo los temas respaldados por una participación vinculada se muestran como
// recomendación en el Directorio. Las categorías del Excel quedan como perfil a validar.
const verifiedForumTopicsFor=(person:Pick<Person,'name'>)=>Array.from(new Set(forums.filter(forum=>forum.people.some(name=>normalizeDirectoryName(name)===normalizeDirectoryName(person.name))).map(forum=>forum.theme)));
const spanishMonths:Record<string,number>={enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,octubre:9,noviembre:10,diciembre:11};
const forumDateAsDate=(date:string)=>{const match=date.match(/(\d{1,2})\s+([a-záéíóú]+)\s+(\d{4})/i);if(!match)return null;const month=spanishMonths[match[2].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()];return month===undefined?null:new Date(Number(match[3]),month,Number(match[1]));};
if(typeof window!=='undefined'){
 const reviewWindow=window as Window & {__unirReviewBadgeTimer?:number};
 if(!reviewWindow.__unirReviewBadgeTimer){
  const updateReviewBadge=()=>{const today=new Date();today.setHours(0,0,0,0);const pending=forums.flatMap(forum=>{const date=forumDateAsDate(forum.date);if(!date)return [];const end=new Date(date);const [hours,minutes]=(forum.endsAt||'23:59').split(':').map(Number);end.setHours(hours,minutes,0,0);const hasFinished=new Date()>=end;return hasFinished?forum.people.filter(name=>!people.find(person=>normalizeDirectoryName(person.name)===normalizeDirectoryName(name))?.rating):[]});const personButton=document.querySelector<HTMLElement>('.sidebar nav button:nth-child(2)');if(!personButton)return;let badge=personButton.querySelector<HTMLElement>('.review-notification-badge');if(!pending.length){badge?.remove();return}if(!badge){badge=document.createElement('span');badge.className='review-notification-badge';personButton.appendChild(badge)}badge.textContent=String(pending.length);badge.title=`${pending.length} valoraciones pendientes`;};
  updateReviewBadge();reviewWindow.__unirReviewBadgeTimer=window.setInterval(updateReviewBadge,30_000);
 }
}
if(typeof window!=='undefined'){
 const reviewFilterWindow=window as Window & {__unirReviewFilterTimer?:number};
 if(!reviewFilterWindow.__unirReviewFilterTimer){
  document.addEventListener('click',event=>{if((event.target as HTMLElement).closest('.sidebar nav button:nth-child(2)'))document.body.dataset.pendingReviews='true'});
  const updatePendingCards=()=>{if(document.body.dataset.pendingReviews!=='true')return;const now=new Date();const pendingNames=new Set(forums.flatMap(forum=>{const date=forumDateAsDate(forum.date);if(!date)return [];const end=new Date(date);const [hours,minutes]=(forum.endsAt||'23:59').split(':').map(Number);end.setHours(hours,minutes,0,0);return now>=end?forum.people.filter(name=>!people.find(person=>normalizeDirectoryName(person.name)===normalizeDirectoryName(name))?.rating):[]}).map(normalizeDirectoryName));document.querySelectorAll<HTMLElement>('.person-card').forEach(card=>{const name=card.querySelector('h3')?.textContent||'';const isPending=pendingNames.has(normalizeDirectoryName(name));card.style.display=isPending?'':'none';let badge=card.querySelector<HTMLElement>('.person-review-pending');if(isPending&&!badge){badge=document.createElement('span');badge.className='person-review-pending';badge.textContent='Valoración pendiente';card.querySelector('.card-top')?.appendChild(badge)}if(!isPending)badge?.remove()});};
  reviewFilterWindow.__unirReviewFilterTimer=window.setInterval(updatePendingCards,500);updatePendingCards();
 }
}
if(typeof window!=='undefined'){
 const directoryViewWindow=window as Window & {__unirDirectoryViewTimer?:number};
 if(!directoryViewWindow.__unirDirectoryViewTimer){
  const addDirectoryViewToggle=()=>{const heading=Array.from(document.querySelectorAll<HTMLElement>('.page-tools h2')).find(item=>item.textContent?.includes('Directorio de ponentes'));const cards=document.querySelector<HTMLElement>('.cards');if(!heading||!cards)return;if(!cards.dataset.directoryViewInitialized){cards.classList.add('directory-list-view');cards.dataset.directoryViewInitialized='true'}const tools=heading.closest<HTMLElement>('.page-tools');if(!tools||tools.querySelector('.directory-view-toggle'))return;const button=document.createElement('button');button.className='directory-view-toggle';button.type='button';button.textContent='Ver tarjetas';button.addEventListener('click',()=>{const isList=cards.classList.toggle('directory-list-view');button.textContent=isList?'Ver tarjetas':'Ver en lista'});tools.appendChild(button)};
  directoryViewWindow.__unirDirectoryViewTimer=window.setInterval(addDirectoryViewToggle,500);addDirectoryViewToggle();
 }
}
if(typeof window!=='undefined'){
 const radarButtonWindow=window as Window & {__unirRadarButtonTimer?:number};
 if(!radarButtonWindow.__unirRadarButtonTimer){
  const addRadarButtons=()=>document.querySelectorAll<HTMLElement>('.radar-profile').forEach(card=>{if(card.querySelector('.add-radar-profile'))return;const button=document.createElement('button');button.className='add-radar-profile';button.type='button';button.textContent='+ Añadir a Radar';button.addEventListener('click',()=>{const copy=card.querySelector<HTMLElement>('.radar-profile-copy');const name=copy?.querySelector('b')?.textContent?.trim();if(!name)return;window.dispatchEvent(new CustomEvent('unir:add-to-radar',{detail:{name,title:copy?.querySelector('span')?.textContent?.trim()||'',source:copy?.querySelector('small')?.textContent?.trim()||'',url:copy?.querySelector<HTMLAnchorElement>('a')?.href||'',evidence:copy?.querySelector('p')?.textContent?.trim()||'',tags:[]}}));button.textContent='Añadido al Radar';button.disabled=true});card.appendChild(button)});
  radarButtonWindow.__unirRadarButtonTimer=window.setInterval(addRadarButtons,500);addRadarButtons();
 }
}
const participatedInPreviousWeek=(person:Pick<Person,'name'>,today=new Date())=>forums.some(forum=>{const date=forumDateAsDate(forum.date);if(!date||!forum.people.some(name=>normalizeDirectoryName(name)===normalizeDirectoryName(person.name)))return false;const sevenDaysAgo=new Date(today);sevenDaysAgo.setDate(today.getDate()-7);return date>=sevenDaysAgo&&date<today;});
// Citas completas detectadas en transcripciones de Foro UNIR en Sonix.
// Priorizamos fórmulas de conversación y respuestas de los expertos, no conectores aislados.
const recurringPhrases=[
 {phrase:'La IA ha venido para quedarse.',forum:'IA en el deporte',time:'26:04',count:1},
 {phrase:'Es una pregunta muy interesante.',forum:'Microbiota y rendimiento deportivo',time:'34:32',count:1},
 {phrase:'Me gusta mucho esa pregunta.',forum:'Microbiota y rendimiento deportivo',time:'47:27',count:1}
];
const nav = [{id:'personas',label:'Ponentes',icon:Users},{id:'buscador-foros',label:'Buscador Foros',icon:Search},{id:'ultimos-foros',label:'Últimos foros',icon:CalendarDays},{id:'radar',label:'Radar',icon:Radar},{id:'archivos',label:'Archivos',icon:FileDown}];
const tagColors:Record<string,string>={IA:'#eee5ff',Educación:'#e5f4eb',Tecnología:'#e5efff',Economía:'#fff0d8',Empresa:'#f1ecdf',Psicología:'#fbe8ee',Salud:'#e3f5f5',Ciencia:'#eaf0ff',Comunicación:'#fff0dd',Cultura:'#f5e9ff',Derecho:'#e9eaed',Diseño:'#e4f4fb',Animación:'#e9f0ff',Videojuegos:'#f2e9ff',Audiovisual:'#e8f5f0'};
const speakerScore=(person:Person)=> (person.recommendation==='repetir'?100:person.recommendation==='no_repetir'?-100:0)+(person.rating||0)*10+(person.internalNote?2:0);
const sourceTabsFor=(person:Person)=>person.id<=12?['Speakers_participantes','Potenciales_speakers','BBDD Ponentes']:[13,14].includes(person.id)?['Vinculados directos a UNIR','BBDD Ponentes']:['BBDD Ponentes'];
const peopleStorageKey='unir-ponentes:directory:v1';
const readSavedPeople=():Person[]=>{if(typeof window==='undefined')return directoryPeople;try{const saved=window.localStorage.getItem(peopleStorageKey);const parsed=saved?JSON.parse(saved):null;return Array.isArray(parsed)&&parsed.every(item=>typeof item?.id==='number'&&typeof item?.name==='string')?parsed:directoryPeople}catch{return directoryPeople}};

function Avatar({person,size='normal'}:{person:{id?:number;initials:string;color:string;photoUrl?:string;rating?:number},size?:'small'|'normal'|'large'}) { const needsRating=typeof person.id==='number'&&!person.rating;return <div className={`avatar ${size}${person.photoUrl?' has-photo':''}${needsRating?' needs-rating':''}`} style={{background:person.color,backgroundImage:person.photoUrl?`url(${person.photoUrl})`:undefined}}>{person.photoUrl ? <span className="sr-only">{person.initials}</span> : person.initials}</div> }
function Tag({children}:{children:string}) { return <span className="tag" style={{background:tagColors[children] || '#f0f1f3'}}>{children}</span> }
function forumMood(forum:Forum,reviews:Record<string,ParticipationReview>){const ratings=forum.people.map(name=>reviews[`${forum.name}::${name}`]?.rating).filter((rating):rating is number=>typeof rating==='number');if(!ratings.length)return {label:'Pendiente de valorar',average:undefined,tone:'pending'};const average=ratings.reduce((total,rating)=>total+rating,0)/ratings.length;return {label:average>=4.5?'Muy dinámico':average>=3.5?'Funcionó bien':average>=2.5?'Correcto': 'Necesita revisión',average,tone:average>=4.5?'great':average>=3.5?'good':average>=2.5?'neutral':'poor'}}
function RecurringPhrases({compact=false}:{compact?:boolean}){return <section className={`recurring-phrases${compact?' recurring-phrases--sidebar':''}`} aria-label="Top frases"><div className="recurring-phrases-head"><div className="recurring-title"><span className="recurring-smile"><Trophy size={20}/></span><h2>Top frases</h2></div></div><div className="phrase-list">{recurringPhrases.map((item,index)=><article key={item.phrase}><strong>{'★'.repeat(3-index)}</strong><div><q>{item.phrase}</q><small><b className="phrase-count">{item.count} {item.count===1?'vez':'veces'}</b></small></div><span style={{'--phrase-width':`${100-index*17}%`} as React.CSSProperties}/></article>)}</div></section>}
export function SpeakersApp(){
 const [view,setView]=useState('personas'); const [query,setQuery]=useState(''); const [activeTag,setActiveTag]=useState(''); const [selected,setSelected]=useState<Person|null>(null); const [selectedCandidate,setSelectedCandidate]=useState<Candidate|null>(null); const [selectedForum,setSelectedForum]=useState<Forum|null>(null); const [personas,setPersonas]=useState<Person[]>(readSavedPeople); const [radar,setRadar]=useState(candidates); const [participationReviews,setParticipationReviews]=useState<Record<string,ParticipationReview>>({});
 useEffect(()=>{try{window.localStorage.setItem(peopleStorageKey,JSON.stringify(personas))}catch{/* El directorio sigue funcionando aunque el navegador bloquee almacenamiento local. */}},[personas]);
 const filtered=useMemo(()=>{const normalized=query.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();const tags=['IA','Educación','Tecnología','Empresa','Salud','Psicología','Derecho','Comunicación','Cultura'];const requestedTags=tags.filter(tag=>normalized.includes(tag.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')));const tokens=normalized.split(/[^a-z0-9]+/).filter(token=>token.length>2&&!['foro','foros','ponente','persona','perfil'].includes(token));return personas.filter(person=>{const verifiedTopics=verifiedForumTopicsFor(person);const profile=`${person.name} ${person.role} ${person.company} ${verifiedTopics.join(' ')} ${person.bio}`.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');const directMatch=!normalized||profile.includes(normalized);const tagMatch=requestedTags.length>0&&verifiedTopics.some(tag=>requestedTags.includes(tag));const wordMatch=tokens.length>0&&tokens.some(token=>profile.includes(token));return (directMatch||tagMatch||wordMatch)&&(!activeTag||verifiedTopics.includes(activeTag))})},[query,activeTag,personas]);
 const convert=(name:string)=>{const c=radar.find(x=>x.name===name);if(!c)return; setPersonas(x=>[...x,{id:Date.now(),name:c.name,role:c.role,company:c.company,tags:c.tags,place:'Por completar',state:'Pendiente',initials:c.initials,color:c.color,bio:c.bio||'Perfil convertido desde Radar. Pendiente de completar.',email:'',phone:'',joined:'Hoy',internalNote:c.internalNote}]);setRadar(x=>x.filter(r=>r.name!==name));};
 const addDiscoveryToRadar=(result:{name:string;title:string;source:string;url:string;evidence:string},tags:string[])=>{setRadar(current=>{if(current.some(candidate=>normalizeDirectoryName(candidate.name)===normalizeDirectoryName(result.name)))return current;const initials=result.name.split(' ').filter(Boolean).slice(0,2).map(word=>word[0]).join('').toUpperCase();return [...current,{name:result.name,role:result.title||'Perfil profesional por revisar',company:result.source||'Fuente pública',tags:tags.length?tags:['Por clasificar'],source:'Radar web',state:'Nuevo',initials,color:'#9fcfe5',bio:result.evidence,internalNote:'Perfil localizado por el Radar; pendiente de validar experiencia, disponibilidad y referencias.',linkedinUrl:/linkedin\\.com/i.test(result.url)?result.url:undefined}]})};
 useEffect(()=>{const addToRadar=(event:Event)=>{const detail=(event as CustomEvent<{name:string;title:string;source:string;url:string;evidence:string;tags:string[]}>).detail;if(!detail?.name)return;setRadar(current=>{if(current.some(candidate=>normalizeDirectoryName(candidate.name)===normalizeDirectoryName(detail.name)))return current;const initials=detail.name.split(' ').filter(Boolean).slice(0,2).map(word=>word[0]).join('').toUpperCase();return [...current,{name:detail.name,role:detail.title||'Perfil profesional por revisar',company:detail.source||'Fuente pública',tags:detail.tags.length?detail.tags:['Por clasificar'],source:'Radar web',state:'Nuevo',initials,color:'#9fcfe5',bio:detail.evidence,internalNote:'Perfil localizado por el Radar; pendiente de validar experiencia, disponibilidad y referencias.',linkedinUrl:/linkedin\\.com/i.test(detail.url)?detail.url:undefined}]})};window.addEventListener('unir:add-to-radar',addToRadar);return()=>window.removeEventListener('unir:add-to-radar',addToRadar)},[]);
 const pageTitle={personas:`Ponentes · ${personas.length}`,'buscador-foros':'Buscador inteligente de Foros UNIR','ultimos-foros':'Últimos foros',radar:'Radar',archivos:'Archivos'}[view] || '';
 const updatePerson=(updated:Person)=>{setPersonas(items=>items.map(person=>person.id===updated.id?updated:person));setSelected(updated)};
 const ratePerson=(person:Person,rating:number)=>setPersonas(items=>items.map(item=>item.id===person.id?{...item,rating}:item));
 return <main className="shell"><aside className="sidebar"><div className="brand"><img className="brand-logo" src="https://www.unir.net/wp-content/uploads/2019/11/Unir_2021_logo.svg" alt="UNIR"/><span className="brand-section">· Ponentes</span></div><nav>{nav.map(n=>{const Icon=n.icon;return <button key={n.id} className={view===n.id?'nav-active':''} onClick={()=>{setView(n.id);setQuery('');setActiveTag('')}}><Icon size={18}/>{n.label}{n.id==='personas'&&<i>{personas.length}</i>}{n.id==='radar'&&<i>{radar.length}</i>}</button>})}</nav></aside><section className="content"><header><div><p className="crumb">Directorio de ponentes</p><h1>{pageTitle}</h1></div></header>{view==='personas'&&<ForumToday openForum={setSelectedForum}/>} {view==='personas'&&<People filtered={filtered} query={query} activeTag={activeTag} setTag={setActiveTag} setSelected={setSelected} ratePerson={ratePerson}/>} {view==='buscador-foros'&&<ForumPlanner/>} {view==='ultimos-foros'&&<Forums setSelected={setSelected} openForum={setSelectedForum} reviews={participationReviews}/>} {view==='radar'&&<RadarPage candidates={radar} convert={convert}/>} {view==='archivos'&&<FilesPage people={personas}/>}</section>{selected&&<PersonSheet person={selected} close={()=>setSelected(null)} save={updatePerson}/>} {selectedCandidate&&<CandidateSheet candidate={selectedCandidate} close={()=>setSelectedCandidate(null)} convert={convert}/>} {selectedForum&&<ForumSheet forum={selectedForum} close={()=>setSelectedForum(null)} setSelected={setSelected} reviews={participationReviews} saveReview={(forumName,personName,review)=>setParticipationReviews(current=>({...current,[`${forumName}::${personName}`]:review}))}/>}</main>
}
function ForumToday({openForum}:{openForum:(forum:Forum)=>void}){const today=new Date();today.setHours(0,0,0,0);const forum=forums.find(item=>forumDateAsDate(item.date)?.getTime()===today.getTime());return <section className="forum-today forum-today-presenters"><div><p className="forum-today-label">HOY</p><h2>{forum?forum.name:'No hay ningún foro programado hoy'}</h2><p>{forum?`Emisión de hoy: ${forum.date}. Consulta la ficha y sus participantes vinculados.`:'Este bloque sólo muestra la emisión correspondiente a la fecha de hoy.'}</p></div>{forum&&<button className="new-button" onClick={()=>openForum(forum)}>Ver foro <ArrowUpRight size={16}/></button>}</section>}
type ForumSearchResult={speaker_id:string;name:string;evidence_type:'explicit_specialty'|'thematic_participation';reason:string;excerpt:string;forum:{id:string;title:string;date:string|null;url:string};limitations:string[]};
function ForumSearch(){
 const [value,setValue]=useState('');const [submitted,setSubmitted]=useState('');const [results,setResults]=useState<ForumSearchResult[]>([]);const [status,setStatus]=useState('');const [focused,setFocused]=useState(false);const [recent,setRecent]=useState<string[]>([]);
 const examples=['gamificación atención alumnos aula','microbiota y rendimiento deportivo','pantallas y salud mental adolescente','IA para diseño y animación','ciberseguridad empresas'];
 const featuredForums=['Gamificación educativa','IA para personalizar el aprendizaje','Pantallas y salud mental adolescente','Ciberseguridad para empresas'];
 useEffect(()=>{try{setRecent(JSON.parse(window.localStorage.getItem('unir-ponentes:foros-recent')||'[]').slice(0,4))}catch{/* La sugerencia es opcional. */}},[]);
 const search=(term:string)=>{const clean=term.trim();if(!clean)return;setValue(clean);setSubmitted(clean);setFocused(false);setRecent(current=>{const next=[clean,...current.filter(item=>item!==clean)].slice(0,4);try{window.localStorage.setItem('unir-ponentes:foros-recent',JSON.stringify(next))}catch{/* La búsqueda no depende del almacenamiento. */}return next})};
 useEffect(()=>{if(!submitted)return;let alive=true;setStatus('Buscando evidencia…');fetch(`/api/foros/search?q=${encodeURIComponent(submitted)}`).then(response=>response.json()).then(data=>{if(!alive)return;setResults(data.results||[]);setStatus(data.note||'')}).catch(()=>alive&&setStatus('No se pudo consultar el archivo de Foros UNIR.'));return()=>{alive=false}},[submitted]);
 return <section className="forum-search"><div className="forum-search-hero"><p className="eyebrow">ARCHIVO VERIFICADO · 127 FOROS</p><h2>Encuentra ponentes con evidencia</h2><p>La búsqueda prioriza especialidades publicadas y explica cuándo una coincidencia procede solo de la participación en un tema.</p><form onSubmit={event=>{event.preventDefault();search(value)}}><div className="forum-search-input"><input aria-label="Consulta de Foros UNIR" value={value} onFocus={()=>setFocused(true)} onChange={event=>setValue(event.target.value)} placeholder="Ej. quién puede hablar de IA en educación"/>{focused&&<div className="forum-search-suggestions" role="listbox" aria-label="Sugerencias de búsqueda">{recent.length>0&&<div><b>Tus búsquedas recientes</b><div>{recent.map(term=><button key={term} type="button" onMouseDown={event=>event.preventDefault()} onClick={()=>search(term)}>{term}</button>)}</div></div>}<div><b>Consultas frecuentes</b><div>{examples.slice(0,3).map(term=><button key={term} type="button" onMouseDown={event=>event.preventDefault()} onClick={()=>search(term)}>{term}</button>)}</div></div><div><b>Foros destacados</b><div>{featuredForums.map(term=><button key={term} type="button" onMouseDown={event=>event.preventDefault()} onClick={()=>search(term)}>{term}</button>)}</div></div></div>}</div><button className="new-button" type="submit"><Search size={16}/>Buscar</button></form><div className="forum-search-examples">{examples.map(example=><button key={example} onClick={()=>search(example)}>{example}</button>)}</div></div>{submitted&&<div className="forum-search-results" aria-live="polite"><div><h2>Resultados para «{submitted}»</h2><p>{status||`${results.length} candidatos con evidencia recuperada.`}</p></div>{results.length===0&&!status&&<p className="empty">No hay candidatos acreditados por este archivo. Prueba otra formulación.</p>}{results.map(result=><article key={`${result.speaker_id}:${result.forum.id}`}><div className="forum-result-head"><div><span className={`evidence-pill ${result.evidence_type}`}>{result.evidence_type==='explicit_specialty'?'Especialidad publicada':'Participación temática'}</span><h3>{result.name}</h3></div><a href={result.forum.url} target="_blank" rel="noreferrer">Ver fuente <ArrowUpRight size={14}/></a></div><p className="forum-result-reason">{result.reason}</p><blockquote>{result.excerpt}</blockquote><footer><span>{result.forum.title}{result.forum.date?` · ${result.forum.date}`:''}</span>{result.limitations.map(limit=><em key={limit}>{limit}</em>)}</footer></article>)}</div>}</section>}
function FilesPage({people}:{people:Person[]}){const records=people.map(person=>({Nombre:person.name,Perfil:person.role,Empresa:person.company,Ubicacion:person.place,Temas:verifiedForumTopicsFor(person).join(', '),Participaciones:forums.filter(forum=>forum.people.some(name=>normalizeDirectoryName(name)===normalizeDirectoryName(person.name))).map(forum=>`${forum.name} (${forum.date})`).join(' | '),Valoracion:person.rating||''}));const download=(content:string,name:string,type:string)=>{const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url)};const csv=()=>{const headers=Object.keys(records[0]||{});const escape=(value:unknown)=>`"${String(value??'').replace(/"/g,'""')}"`;return [headers.join(','),...records.map(row=>headers.map(header=>escape(row[header as keyof typeof row])).join(','))].join('\n')};const markdown=()=>['# Directorio de ponentes UNIR','',`Actualizado: ${new Date().toLocaleDateString('es-ES')}`,'',...records.map(row=>`## ${row.Nombre}\n- Perfil: ${row.Perfil}\n- Empresa: ${row.Empresa}\n- Ubicación: ${row.Ubicacion}\n- Temas: ${row.Temas||'Sin tema verificado'}\n- Participaciones: ${row.Participaciones||'Sin participaciones registradas'}\n- Valoración: ${row.Valoracion||'Sin valorar'}\n`)].join('\n');const excel=()=>`<table><tr>${Object.keys(records[0]||{}).map(header=>`<th>${header}</th>`).join('')}</tr>${records.map(row=>`<tr>${Object.values(row).map(value=>`<td>${String(value)}</td>`).join('')}</tr>`).join('')}</table>`;return <section className="files-page"><p>Descarga una copia portátil del directorio y sus participaciones. Las exportaciones no incluyen notas internas ni datos de acceso.</p><div className="file-downloads"><button onClick={()=>download(csv(),'ponentes-unir.csv','text/csv;charset=utf-8')}><FileDown size={18}/><span><b>CSV</b><small>Para hojas de cálculo y sistemas</small></span></button><button onClick={()=>download(excel(),'ponentes-unir.xls','application/vnd.ms-excel')}><FileDown size={18}/><span><b>Excel</b><small>Compatible con Microsoft Excel</small></span></button><button onClick={()=>download(markdown(),'ponentes-unir.md','text/markdown;charset=utf-8')}><FileDown size={18}/><span><b>Markdown</b><small>Ficha legible y versionable</small></span></button><button onClick={()=>download(markdown(),'ponentes-unir.txt','text/plain;charset=utf-8')}><FileDown size={18}/><span><b>Texto plano</b><small>Consulta rápida sin formato</small></span></button></div></section>}
function RecentForumsCarousel({openForum,showAll}:{openForum:(forum:Forum)=>void;showAll:()=>void}){
 const today=new Date();today.setHours(0,0,0,0);const monday=new Date(today);monday.setDate(today.getDate()-(today.getDay()+6)%7);const sunday=new Date(monday);sunday.setDate(monday.getDate()+6);const recent=[...forums].filter(forum=>{const date=forumDateAsDate(forum.date);return Boolean(date&&date>=monday&&date<=sunday)}).sort((a,b)=>(forumDateAsDate(a.date)?.getTime()||0)-(forumDateAsDate(b.date)?.getTime()||0)); const cards=Array.from({length:7},(_,index)=>{const date=new Date(monday);date.setDate(monday.getDate()+index);const existing=recent.find(forum=>forumDateAsDate(forum.date)?.getTime()===date.getTime());return existing||{name:`${date.toLocaleDateString('es-ES',{weekday:'long'})} · Sin foro programado`,date:`${date.getDate()} ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][date.getMonth()]} ${date.getFullYear()}`,theme:'Agenda',people:[]}}); const marqueeRef=useRef<HTMLDivElement>(null); const trackRef=useRef<HTMLDivElement>(null); const drag=useRef({pointerId:-1,startX:0,startScroll:0,moved:false,forumIndex:-1}); const [dragging,setDragging]=useState(false); const [frozenTransform,setFrozenTransform]=useState<string>();
 const beginDrag=(event:React.PointerEvent<HTMLDivElement>)=>{const marquee=marqueeRef.current;const track=trackRef.current;if(!marquee||!track)return;const card=(event.target as HTMLElement).closest<HTMLElement>('[data-forum-index]');setFrozenTransform(window.getComputedStyle(track).transform);drag.current={pointerId:event.pointerId,startX:event.clientX,startScroll:marquee.scrollLeft,moved:false,forumIndex:Number(card?.dataset.forumIndex??-1)};marquee.setPointerCapture(event.pointerId);setDragging(true)};
 const moveDrag=(event:React.PointerEvent<HTMLDivElement>)=>{const marquee=marqueeRef.current;if(!marquee||drag.current.pointerId!==event.pointerId)return;const distance=event.clientX-drag.current.startX;if(Math.abs(distance)>4)drag.current.moved=true;marquee.scrollLeft=drag.current.startScroll-distance};
 const endDrag=(event:React.PointerEvent<HTMLDivElement>)=>{const marquee=marqueeRef.current;if(drag.current.pointerId!==event.pointerId)return;const {moved,forumIndex}=drag.current;if(marquee?.hasPointerCapture(event.pointerId))marquee.releasePointerCapture(event.pointerId);drag.current.pointerId=-1;setDragging(false);setFrozenTransform(undefined);if(!moved&&forumIndex>=0)openForum(cards[forumIndex]);window.setTimeout(()=>{drag.current.moved=false;drag.current.forumIndex=-1},0)};
 return <section className="recent-forums weekly-forums" aria-label="Foros de esta semana"><div className="recent-forums-head"><div><p className="eyebrow">AGENDA SEMANAL</p><h2>Foros de esta semana</h2></div><div className="recent-forums-actions"><button onClick={showAll}>Todos los foros <ArrowUpRight size={14}/></button></div></div><div ref={marqueeRef} className={`forum-marquee${dragging?' is-dragging':''}`} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}><div ref={trackRef} className="forum-track" style={dragging&&frozenTransform?{transform:frozenTransform}:undefined}>{cards.map((forum,index)=><button data-forum-index={index} className={`forum-preview forum-preview-${index%4}`} key={forum.name} onClick={()=>{if(!drag.current.moved)openForum(forum)}}><div className={`forum-motion${forum.previewImage?' has-preview':''}`} style={forum.previewImage?{backgroundImage:`linear-gradient(0deg,#0d263c88,#0d263c12), url(${forum.previewImage})`}:undefined}>{!forum.previewImage&&<><i/><i/><i/></>}<span className="forum-live-dot"/><Play size={18} fill="currentColor"/></div><div className="forum-preview-copy"><span>{forum.date}</span><b>{forum.name}</b><small>{forum.theme} <ArrowUpRight size={13}/></small></div></button>)}</div></div></section>
}
function UnresolvedTasks({setView}:{setView:(view:string)=>void}){
 const [now,setNow]=useState(()=>new Date());const [open,setOpen]=useState(true);
 useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),30_000);return()=>window.clearInterval(timer)},[]);
 const pending=forums.filter(forum=>{const date=forumDateAsDate(forum.date);if(!date||!forum.endsAt||!forum.people.length)return false;const [hours,minutes]=forum.endsAt.split(':').map(Number);date.setHours(hours,minutes,0,0);return now>=date});
 if(!pending.length)return null;
 const peopleToReview=pending.reduce((total,forum)=>total+forum.people.length,0);
 return <section className="unresolved-tasks" aria-live="polite"><button className="unresolved-bell" onClick={()=>setOpen(value=>!value)} aria-expanded={open}><Bell size={17}/><span className="unresolved-count">{pending.length}</span><span>Tareas pendientes</span><ChevronRight size={16}/></button>{open&&<div className="unresolved-list">{pending.map(forum=><article key={forum.name}><div><b>Valorar a {forum.people.length} {forum.people.length===1?'ponente':'ponentes'}</b><span>{forum.name}</span></div><button onClick={()=>setView('foros')}>Abrir valoración <ArrowUpRight size={14}/></button></article>)}<p>Hay {peopleToReview} {peopleToReview===1?'intervención por revisar':'intervenciones por revisar'}.</p></div>}</section>
}
function NeedsFinder({people,setSelected,setView,setTag}:{people:Person[];setSelected:(p:Person)=>void;setView:(x:string)=>void;setTag:(x:string)=>void}){
 const [need,setNeed]=useState('');const [submitted,setSubmitted]=useState(false);const [forumDate,setForumDate]=useState('');const [country,setCountry]=useState('Todos');const [faculty,setFaculty]=useState('Todas');
 const normalize=(value:string)=>value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const topics=[
  {label:'Educación',terms:['educacion','docente','profesor','profesora','pedagog','aprendizaje','aula','didact','ensenanza','orientacion educativa','altas capacidades','comprension lectora']},
  {label:'Cuidados de mayores',terms:['mayores','mayor','geriatr','geront','envejec','dependencia','residencia','cuidados']},
  {label:'Salud mental',terms:['salud mental','psicolog','psiquiatr','bienestar emocional','autoles']},
  {label:'Inteligencia artificial',terms:['inteligencia artificial','machine learning','algoritm']},
  {label:'Ciberseguridad',terms:['ciberseguridad','seguridad de la informacion','ciso','devsecops']},
  {label:'Tecnología',terms:['tecnolog','software','cloud','datos','digital']},
  {label:'Derecho y gobierno',terms:['derecho','abogad','legisl','gobierno','administracion publica','politica publica']},
  {label:'Cultura y literatura',terms:['literatura','escritor','poeta','dramaturg','cine','cultura']},
  {label:'Empresa e innovación',terms:['empresa','negocio','emprend','innovacion','marketing','liderazgo']}
 ];
 const normalizedNeed=normalize(need);
 const selectedTopics=topics.filter(topic=>normalizedNeed.includes(normalize(topic.label))||topic.terms.some(term=>normalizedNeed.includes(term))||(topic.label==='Inteligencia artificial'&&normalizedNeed.split(/[^a-z0-9]+/).includes('ia')));
 const ignoredWords=new Set(['ponente','para','foro','foros','que','con','del','las','los','una','uno','como','sobre','quiero','necesito','busco','persona','personas','profesional','especialista']);
 const tokens=normalizedNeed.split(/[^a-z0-9]+/).filter(token=>token.length>3&&!ignoredWords.has(token));
 const scheduledDate=forumDate?new Date(`${forumDate}T12:00:00`):new Date();
 const countries=['Todos',...Array.from(new Set(people.map(person=>person.place))).sort((a,b)=>a.localeCompare(b,'es'))];
 const facultyFor=(person:Person)=>{const profile=normalize(`${person.role} ${person.company} ${person.tags.join(' ')} ${person.bio}`);if(/educacion|docente|profesor|pedagog|aprendizaje|aula/.test(profile))return 'Educación';if(/salud|psicolog|psiquiatr|medic|nutric|microbiota/.test(profile))return 'Ciencias de la Salud';if(/derecho|abogad|legisl|gobierno|politica publica/.test(profile))return 'Derecho';if(/diseno|animacion|videojuegos|audiovisual|literatura|poeta|dramaturg|cine|cultura/.test(profile))return 'Artes y Ciencias Sociales';if(/tecnolog|software|cloud|datos|ciberseguridad|devops|inteligencia artificial/.test(profile))return 'Ingeniería y Tecnología';if(/empresa|negocio|emprend|marketing|finanz|innovacion/.test(profile))return 'Economía y Empresa';return 'Otras áreas'};
 const faculties=['Todas','Educación','Ciencias de la Salud','Economía y Empresa','Ingeniería y Tecnología','Derecho','Artes y Ciencias Sociales','Otras áreas'];
 const matches=people.filter(person=>(country==='Todos'||person.place===country)&&(faculty==='Todas'||facultyFor(person)===faculty)).map(person=>{
  const professionalProfile=normalize(`${person.role} ${person.company} ${person.bio}`);
  const topicMatches=selectedTopics.filter(topic=>topic.terms.some(term=>professionalProfile.includes(term)));
  const tokenHits=tokens.filter(token=>professionalProfile.includes(token));
  const participations=forums.filter(forum=>forum.people.some(name=>normalizeDirectoryName(name)===normalizeDirectoryName(person.name)));
  const recentForum=participations.find(forum=>{const date=forumDateAsDate(forum.date);const sevenDaysAgo=new Date(scheduledDate);sevenDaysAgo.setDate(scheduledDate.getDate()-7);return Boolean(date&&date>=sevenDaysAgo&&date<scheduledDate)});
  const reasons:string[]=[];
  if(topicMatches.length)reasons.push(`Especialidad profesional: ${topicMatches.map(topic=>topic.label).join(', ')}`);
  if(tokenHits.length&&!topicMatches.length)reasons.push(`Coincide en cargo o trayectoria: ${tokenHits.slice(0,2).join(', ')}`);
  if(participations.length)reasons.push(`Participó en ${participations[0].name}`);
  if(person.recommendation==='repetir')reasons.push(`Valoración interna positiva${person.rating?` (${person.rating}/5)`:''}`);
  const coversAllTopics=selectedTopics.length===0||topicMatches.length===selectedTopics.length;
  const evidenceMatch=selectedTopics.length?coversAllTopics:tokenHits.length>0;
  const score=(topicMatches.length*100)+(tokenHits.length*20)+(participations.length*10)+(person.recommendation==='repetir'?15:0)-(recentForum?12:0);
  return {person,reasons,evidenceMatch,recentForum,score}
 }).filter(result=>result.evidenceMatch).sort((a,b)=>(faculty==='Todas'?facultyFor(a.person).localeCompare(facultyFor(b.person),'es'):0)||b.score-a.score||speakerScore(b.person)-speakerScore(a.person)||a.person.name.localeCompare(b.person.name,'es')).slice(0,8);
 const primaryTopic=selectedTopics[0];
 const chooseTopic=(label:string)=>{setNeed(current=>current===label?'':label);setSubmitted(false)};
 return <section className="needs-finder">
  <div><h2>Buscar por especialidad</h2><p>Selecciona una temática o escribe una profesión, sector o necesidad concreta. Los resultados se basan en el cargo y la trayectoria profesional registrada, no en etiquetas genéricas.</p></div>
  <div className="finder-topics"><span>Temas frecuentes:</span>{topics.map(topic=><button className={selectedTopics.some(selected=>selected.label===topic.label)?'chosen':''} type="button" onClick={()=>chooseTopic(topic.label)} key={topic.label}>{topic.label}</button>)}</div>
  <form onSubmit={event=>{event.preventDefault();setSubmitted(true)}}><input value={need} onChange={event=>{setNeed(event.target.value);setSubmitted(false)}} placeholder="Ej. Educación, cuidados de mayores o ciberseguridad"/><label className="forum-country-input">País<select value={country} onChange={event=>{setCountry(event.target.value);setSubmitted(false)}}>{countries.map(item=><option key={item}>{item}</option>)}</select></label><label className="forum-country-input">Facultad / área<select value={faculty} onChange={event=>{setFaculty(event.target.value);setSubmitted(false)}}>{faculties.map(item=><option key={item}>{item}</option>)}</select></label><label className="forum-date-input">Fecha del foro (opcional)<input type="date" value={forumDate} onChange={event=>{setForumDate(event.target.value);setSubmitted(false)}}/></label><button className="new-button" type="submit"><Search size={16}/>Buscar perfiles</button></form>
  {selectedTopics.length>0&&<div className="active-search-tags" aria-live="polite"><span>Especialidades:</span>{selectedTopics.map(topic=><Tag key={topic.label}>{topic.label}</Tag>)}</div>}
  {submitted&&<div className="need-results">
   <div className="need-result-head"><span>{matches.length?`${matches.length} perfiles con especialidad contrastada`:'No hay coincidencias contrastadas en cargo o trayectoria para esta búsqueda'}</span>{primaryTopic&&<button onClick={()=>{setTag(primaryTopic.label==='Inteligencia artificial'?'IA':primaryTopic.label);setView('personas')}}>Ver directorio</button>}</div>
   {!selectedTopics.length&&!tokens.length&&<p className="data-note">Selecciona una temática o escribe una especialidad para iniciar la búsqueda.</p>}
   {matches.map(({person,reasons,recentForum})=><button className="need-person need-person-evidence" key={person.id} onClick={()=>setSelected(person)}><Avatar person={person}/><span><b>{person.name}</b><small>{person.role} · {person.company}</small><em>{reasons.join(' · ')}</em>{recentForum&&<i className="recent-forum-alert">⚠ Participó el {recentForum.date} en “{recentForum.name}”</i>}</span><div>{person.recommendation==='repetir'&&<em>Nos gustó</em>}{person.rating&&<strong>{person.rating}/5</strong>}</div><ChevronRight size={16}/></button>)}
  </div>}
 </section>}
function Dashboard({setView,setTag,people,candidates,setSelected,setSelectedCandidate,openForum}:{setView:(x:string)=>void;setTag:(x:string)=>void;people:Person[];candidates:Candidate[];setSelected:(p:Person)=>void;setSelectedCandidate:(c:Candidate)=>void;openForum:(forum:Forum)=>void}){const tags=['IA','Educación','Economía','Tecnología','Comunicación'];const linkedParticipations=forums.reduce((total,forum)=>total+forum.people.length,0);const now=new Date();const today=new Date(now);today.setHours(0,0,0,0);const emitted=[...forums].filter(forum=>{const date=forumDateAsDate(forum.date);return Boolean(date&&date<now)}).sort((a,b)=>(forumDateAsDate(b.date)?.getTime()||0)-(forumDateAsDate(a.date)?.getTime()||0));const forumInFocus=forums.find(forum=>forumDateAsDate(forum.date)?.getTime()===today.getTime());const presenter=forumInFocus?.presenter?presenters[forumInFocus.presenter as keyof typeof presenters]:undefined;const recentPeople=Array.from(new Map(emitted.flatMap(forum=>forum.people.map(name=>people.find(person=>normalizeDirectoryName(person.name)===normalizeDirectoryName(name)))).filter((person):person is Person=>Boolean(person)).map(person=>[person.id,person])).values()).slice(0,4);return <><section className="forum-today"> <div><p className="eyebrow">{forumInFocus&&<span className="recording-indicator"><i/>REC · </span>}FORO DE HOY{forumInFocus?' · EN DIRECTO':' · SIN EMISIÓN'}</p><h2>{forumInFocus?forumInFocus.name:'No hay ningún foro programado hoy'}</h2><p>{forumInFocus?`Emisión de hoy: ${forumInFocus.date}. Abre su ficha para valorar a cada participante y añadir una nota.`:'Este bloque solo muestra la emisión correspondiente a la fecha de hoy.'}</p>{presenter&&<div className="forum-presenter"><Avatar person={presenter}/><span>Presentado por <b>{presenter.name}</b><small>{presenter.role}</small></span></div>}</div>{forumInFocus&&<button className="new-button" onClick={()=>openForum(forumInFocus)}>Valorar ponentes <ArrowUpRight size={16}/></button>}</section><NeedsFinder people={people} setSelected={setSelected} setView={setView} setTag={setTag}/><div className="stats">{[['Personas en base de datos',people.length,Users],['En radar',candidates.length,Radar],['Foros',forums.length,CalendarDays],['Participaciones vinculadas',linkedParticipations,Clock3]].map(([l,n,Icon]:any)=><div className="stat" key={l}><div><span>{l}</span><strong>{n}</strong></div><Icon size={20}/></div>)}</div><section className="quick"><p>Explora por temas verificados</p><div>{tags.map(t=><button onClick={()=>{setTag(t);setView('personas')}} key={t}>{t}<ArrowUpRight size={14}/></button>)}</div></section><div className="two-columns"><section className="panel"><div className="panel-title"><div><h2>Ponentes de los últimos foros</h2><p>Participantes vinculados a las emisiones más recientes</p></div><button onClick={()=>setView('personas')}>Ver las {people.length} personas <ChevronRight size={16}/></button></div><div className="person-list">{recentPeople.length?recentPeople.map(p=>{const topics=verifiedForumTopicsFor(p);return <button className="list-person" key={p.id} onClick={()=>setSelected(p)}><Avatar person={p}/><span><b>{p.name}</b><small>{p.role} · {p.company}</small></span><div className="list-tags">{topics.slice(0,2).map(t=><Tag key={t}>{t}</Tag>)}</div><ChevronRight size={17}/></button>}):<p className="empty">Aún no hay participantes vinculados a los últimos foros.</p>}</div></section><section className="panel"><div className="panel-title"><div><h2>Candidatos recientes</h2><p>Pulsa un candidato para abrir su ficha de revisión</p></div><button onClick={()=>setView('radar')}>Ver radar <ChevronRight size={16}/></button></div><div className="candidate-list">{candidates.map(c=><button className="candidate candidate-button" key={c.name} onClick={()=>setSelectedCandidate(c)}><Avatar person={c}/><span><b>{c.name}</b><small>{c.role} · {c.company}</small><em>{c.source}</em></span><i className={'badge '+c.state.toLowerCase()}>{c.state}</i><ChevronRight size={16}/></button>)}</div></section></div></>}
function AdminPanel(){return <><section className="admin-hero"><div><span className="admin-icon"><ShieldCheck size={23}/></span><div><p className="eyebrow">CONTROL DE ACCESO</p><h2>Acceso aún no configurado</h2><p>La gestión de usuarios está desactivada en esta versión. No se almacenan ni se muestran cuentas autorizadas en el cliente.</p></div></div><span className="badge pendiente">Pendiente de configurar</span></section><section className="admin-permissions"><article><ShieldCheck size={19}/><div><b>Requisito antes de habilitarlo</b><p>El acceso debe validarse en servidor con identidad corporativa, autorización por roles y un registro de auditoría.</p></div></article></section><section className="admin-next"><strong>Próximo paso</strong><p>Integra un proveedor de identidad y una API de autorización antes de exponer la administración. Las cuentas y sus permisos no deben definirse en código de interfaz ni enviarse al navegador.</p></section></>}
function People({filtered,query,activeTag,setTag,setSelected,ratePerson}:{filtered:Person[];query:string;activeTag:string;setTag:(x:string)=>void;setSelected:(p:Person)=>void;ratePerson:(p:Person,rating:number)=>void}){const [order,setOrder]=useState<'foro'|'valoracion'|'nombre'|'reciente'>('foro');const recurringForumAreas=[{label:'Ingeniería y Tecnología',tag:'Tecnología'},{label:'Ciencias de la Salud',tag:'Salud'},{label:'Inteligencia Artificial',tag:'IA'},{label:'Educación',tag:'Educación'},{label:'Humanidades',tag:'Cultura'}];const lastForumDate=(person:Person)=>Math.max(0,...forums.filter(forum=>forum.people.some(name=>normalizeDirectoryName(name)===normalizeDirectoryName(person.name))).map(forum=>forumDateAsDate(forum.date)?.getTime()||0));const ordered=[...filtered].sort((a,b)=>order==='nombre'?a.name.localeCompare(b.name,'es'):order==='reciente'?b.id-a.id:order==='valoracion'?speakerScore(b)-speakerScore(a)||a.name.localeCompare(b.name,'es'):lastForumDate(b)-lastForumDate(a)||speakerScore(b)-speakerScore(a));return <><div className="page-tools"><div><h2>Directorio de ponentes</h2><p>{ordered.length} personas encontradas · por defecto, los últimos participantes aparecen primero</p></div><label className="sort-control">Ordenar<select value={order} onChange={event=>setOrder(event.target.value as 'foro'|'valoracion'|'nombre'|'reciente')}><option value="foro">Última participación</option><option value="valoracion">Mejor valoración</option><option value="nombre">Nombre (A–Z)</option><option value="reciente">Incorporación</option></select></label></div><div className="filter-row"><span>Áreas más recurrentes en Foro UNIR:</span>{recurringForumAreas.map(item=><button className={activeTag===item.tag?'chosen':''} onClick={()=>setTag(activeTag===item.tag?'':item.tag)} key={item.tag}>{item.label}</button>)}{(activeTag||query)&&<button className="clear" onClick={()=>setTag('')}>Limpiar</button>}</div><details className="source-accordion"><summary>Origen de los registros</summary><div><Tag>BBDD Ponentes</Tag><Tag>Speakers_participantes</Tag><Tag>Potenciales_speakers</Tag><Tag>Vinculados directos a UNIR</Tag></div></details><div className="cards">{ordered.map(p=>{const topics=verifiedForumTopicsFor(p);return <article className="person-card" onClick={()=>setSelected(p)} key={p.id}><div className="card-top"><Avatar person={p} size="large"/></div><h3>{p.name}</h3><p>{p.role}</p><p>{lastForumDate(p)?`Último foro: ${forums.find(f=>forumDateAsDate(f.date)?.getTime()===lastForumDate(p))?.date}`:'Sin foro vinculado'}</p><p className="company">{p.company}</p><div className="card-tags">{topics.length?topics.map(t=><Tag key={t}>{t}</Tag>):<span className="unverified-topic">Sin tema verificado</span>}</div><div className="card-rating" onClick={event=>event.stopPropagation()}><span>Valorar</span>{[1,2,3,4,5].map(star=><button key={star} onClick={()=>ratePerson(p,star)} className={(p.rating||0)>=star?'is-rated':''} aria-label={`Valorar a ${p.name} con ${star} estrellas`}>★</button>)}</div><span className="profile-link">Ver ficha <ArrowUpRight size={15}/></span></article>})}</div></>}
function RadarPage({candidates,convert}:{candidates:Candidate[];convert:(x:string)=>void}){return <><div className="page-tools"><div><h2>Radar de talento</h2><p>Candidatos por contrastar antes de incorporarlos al directorio</p></div><button className="filter"><SlidersHorizontal size={16}/>Filtrar</button></div><section className="radar-explainer"><strong>¿De dónde salen?</strong><p>Estos perfiles proceden de las pestañas <b>“Potenciales speakers”</b> y <b>“Speakers que no alcanzaron”</b> de la BBDD compartida. No son perfiles extraídos automáticamente de LinkedIn.</p><span>Antes de convertir un candidato, revisa su perfil profesional y al menos una intervención pública.</span></section><div className="radar-table"><div className="table-header radar-header"><span>PERSONA Y PERFIL</span><span>ENCAJE</span><span>ORIGEN</span><span>VALIDACIÓN EXTERNA</span><span/></div>{candidates.map(c=>{const linkedinSearch=`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${c.name} ${c.company}`)}`;const youtubeSearch=`https://www.youtube.com/results?search_query=${encodeURIComponent(`${c.name} conferencia entrevista`)}`;return <div className="table-row radar-row" key={c.name}><div className="person-cell"><Avatar person={c}/><span><b>{c.name}</b><small>{c.role} · {c.company}</small></span></div><div className="table-tags">{c.tags.map((t:string)=><Tag key={t}>{t}</Tag>)}</div><div className="radar-source"><span>{c.source}</span><small>{c.internalNote||'Pendiente de primera revisión.'}</small></div><div className="radar-links"><a href={c.linkedinUrl||linkedinSearch} target="_blank" rel="noreferrer"><Linkedin size={14}/>{c.linkedinUrl?'LinkedIn verificado':'Buscar LinkedIn'}</a><a href={c.videoUrl||youtubeSearch} target="_blank" rel="noreferrer"><CalendarDays size={14}/>{c.videoUrl?'Ver intervención':'Buscar vídeo'}</a></div><button className="convert" onClick={()=>convert(c.name)}><Check size={15}/>Revisar e incorporar</button></div>})}</div></>}
function Forums({setSelected,openForum,reviews}:{setSelected:(p:Person)=>void;openForum:(forum:Forum)=>void;reviews:Record<string,ParticipationReview>}){const today=new Date();today.setHours(0,0,0,0);const emitted=[...forums].filter(forum=>{const date=forumDateAsDate(forum.date);return Boolean(date&&date<today)}).sort((a,b)=>(forumDateAsDate(b.date)?.getTime()||0)-(forumDateAsDate(a.date)?.getTime()||0)).slice(0,12);return <><div className="page-tools"><div><h2>Últimos foros emitidos</h2><p>Las 12 emisiones verificadas más recientes y sus ponentes vinculados</p></div></div><div className="forum-list">{emitted.map(f=>{const mood=forumMood(f,reviews);return <article className="forum forum-openable" key={f.name} onClick={()=>openForum(f)}><div className="forum-date"><strong>{f.date.split(' ')[0]}</strong><span>{f.date.split(' ')[1].slice(0,3)}</span></div><div className="forum-body"><div className="forum-heading"><Tag>{f.theme}</Tag><span className={`forum-mood ${mood.tone}`}>{mood.average&&<b>★ {mood.average.toFixed(1)}</b>}{mood.label}</span></div><h2>{f.name}</h2><p>{f.sourceUrl?'Foro publicado por UNIR. Abre la ficha para consultar participantes y contenido relacionado.':'Encuentro UNIR con expertos para conversar sobre los retos actuales.'}</p>{f.sourceUrl&&<a className="forum-link" href={f.sourceUrl} target="_blank" rel="noreferrer" onClick={event=>event.stopPropagation()}>{f.sourceLabel}<ArrowUpRight size={14}/></a>}<div className="attendees"><span>{f.people.length?'Ponentes participantes':'Ponentes por vincular'}</span>{f.people.length?f.people.map(n=>{const p=people.find(x=>x.name===n);return p?<button onClick={event=>{event.stopPropagation();setSelected(p)}} key={n}><Avatar person={p} size="small"/>{n}</button>:null}):<em>Consulta la ficha oficial para añadirlos al directorio.</em>}</div></div><ChevronRight className="forum-arrow" size={20}/></article>})}</div></>}
function TranscriptQueue(){const [items,setItems]=useState(()=>forums.filter(f=>f.youtubeUrl).map(f=>({name:f.name,url:f.youtubeUrl!,status:'Pendiente'})));return <><div className="page-tools"><div><h2>Preparación para Sonix</h2><p>Cola interna: abre Sonix, procesa los pendientes y pega el resultado cuando esté listo.</p></div><button className="new-button" onClick={()=>setItems(x=>[...x,{name:'Nueva grabación',url:'',status:'Pendiente'}])}><Plus size={17}/>Añadir vídeo</button></div><div className="forum-list">{items.map((item,index)=><article className="forum" key={`${item.name}-${index}`}><div className="forum-date"><Captions size={21}/></div><div className="forum-body"><div className="forum-heading"><Tag>{item.status}</Tag></div><h2>{item.name}</h2><p>{item.url?'Vídeo listo para abrir y cargar en Sonix. Verifica antes que UNIR dispone de los derechos necesarios.':'Añade el enlace o archivo autorizado antes de iniciar la transcripción.'}</p>{item.url&&<a className="forum-link" href={item.url} target="_blank" rel="noreferrer">Abrir vídeo<ArrowUpRight size={14}/></a>}</div><button className="save-feedback" onClick={()=>setItems(x=>x.map((entry,i)=>i===index?{...entry,status:entry.status==='Pendiente'?'En Sonix':entry.status==='En Sonix'?'Transcripción lista':'Pendiente'}:entry))}>{item.status==='Pendiente'?'Marcar enviado a Sonix':item.status==='En Sonix'?'Marcar como lista':'Reabrir'}</button></article>)}</div></>}
function ForumSheet({forum,close,setSelected,reviews,saveReview}:{forum:Forum;close:()=>void;setSelected:(person:Person)=>void;reviews:Record<string,ParticipationReview>;saveReview:(forumName:string,personName:string,review:ParticipationReview)=>void}){
 const linkedPeople=forum.people.map(name=>people.find(person=>normalizeDirectoryName(person.name)===normalizeDirectoryName(name))).filter((person):person is Person=>Boolean(person)); const videoSearch=`https://www.youtube.com/results?search_query=${encodeURIComponent(`UNIR ${forum.name}`)}`; const videoId=forum.youtubeUrl?.match(/[?&]v=([^&]+)/)?.[1]||forum.youtubeUrl?.match(/youtu\.be\/([^?&/]+)/)?.[1]; const embedUrl=videoId?`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`:undefined;
 return <div className="overlay" onMouseDown={event=>{if(event.target===event.currentTarget)close()}}><aside className="sheet forum-sheet"><button className="close" onClick={close}><X size={20}/></button><p className="eyebrow">FORO EMITIDO</p>{embedUrl?<div className="forum-video"><iframe src={embedUrl} title={`Grabación: ${forum.name}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>:forum.sourceUrl?<a className="forum-sheet-poster forum-recording-link" href={forum.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Ver grabación oficial de ${forum.name}`}><span className="forum-live-dot"/><Play size={27} fill="currentColor"/><span className="play-label">Ver grabación oficial</span></a>:<button className="forum-sheet-poster" disabled aria-label="Grabación pendiente de enlazar"><span className="forum-live-dot"/><Play size={27} fill="currentColor"/></button>}<Tag>{forum.theme}</Tag><h2>{forum.name}</h2><p className="forum-sheet-date"><CalendarDays size={15}/>{forum.date}</p><div className="candidate-detail"><h3>Participantes vinculados</h3>{linkedPeople.length?<div className="forum-sheet-people">{linkedPeople.map(person=>{const review=reviews[`${forum.name}::${person.name}`];return <article className="forum-person-review" key={person.id}><button onClick={()=>{close();setSelected(person)}}><Avatar person={person}/><i className={`avatar-stars${review?.rating?' is-rated':''}`} title={review?.rating?`${review.rating} de 5 estrellas`:'Sin valorar'}>★<b>{review?.rating||'—'}</b></i><span><b>{person.name}</b><small>{person.role}</small></span><ChevronRight size={16}/></button><div className="participation-rating"><span>Valoración de esta intervención</span><div>{[1,2,3,4,5].map(star=><button key={star} onClick={()=>saveReview(forum.name,person.name,{...review,rating:star})} aria-label={`${star} estrellas`} className={(review?.rating||0)>=star?'rated':''}>★</button>)}<em>{review?.rating?`${review.rating}/5`:'Sin valorar'}</em></div><input className="participation-note" value={review?.note||''} onChange={event=>saveReview(forum.name,person.name,{...review,note:event.target.value})} placeholder="Nota breve (opcional)" aria-label={`Nota sobre la intervención de ${person.name}`}/></div></article>})}</div>:<p>Aún no hay participantes asociados a este foro.</p>}</div><div className="candidate-detail"><h3>Acceder al contenido</h3>{forum.sourceUrl&&<a className="profile-resource" href={forum.sourceUrl} target="_blank" rel="noreferrer"><CalendarDays size={16}/>{forum.sourceLabel||'Abrir ficha del foro'}<ArrowUpRight size={13}/></a>}{!embedUrl&&<a className="profile-resource" href={videoSearch} target="_blank" rel="noreferrer"><Play size={16}/>Buscar grabación en YouTube<ArrowUpRight size={13}/></a>}{embedUrl&&<p className="data-note">Reproduce el foro aquí, sin salir del directorio.</p>}{!embedUrl&&<p className="data-note">La grabación se muestra en la ficha oficial hasta que validemos un enlace embebible.</p>}</div></aside></div>
}
function CandidateSheet({candidate,close,convert}:{candidate:Candidate;close:()=>void;convert:(name:string)=>void}){const linkedin=`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${candidate.name} ${candidate.company}`)}`;const youtube=`https://www.youtube.com/results?search_query=${encodeURIComponent(`${candidate.name} conferencia entrevista`)}`;return <div className="overlay"><aside className="sheet"><button className="close" onClick={close}><X size={20}/></button><p className="eyebrow">CANDIDATO EN REVISIÓN</p><div className="profile-hero"><Avatar person={candidate} size="large"/><div><span className={'badge '+candidate.state.toLowerCase()}>{candidate.state}</span><h2>{candidate.name}</h2><p>{candidate.role}</p><p>{candidate.company}</p></div></div><div className="tag-set">{candidate.tags.map(tag=><Tag key={tag}>{tag}</Tag>)}</div><div className="candidate-detail"><h3>Origen del candidato</h3><p><b>{candidate.source}</b></p><p>{candidate.internalNote||'Pendiente de revisar.'}</p></div><div className="candidate-detail"><h3>Validación externa</h3><a className="profile-resource" href={candidate.linkedinUrl||linkedin} target="_blank" rel="noreferrer"><Linkedin size={16}/>{candidate.linkedinUrl?'Abrir LinkedIn verificado':'Buscar perfil en LinkedIn'}<ArrowUpRight size={13}/></a><a className="profile-resource" href={candidate.videoUrl||youtube} target="_blank" rel="noreferrer"><CalendarDays size={16}/>{candidate.videoUrl?'Ver intervención pública':'Buscar vídeo o entrevista'}<ArrowUpRight size={13}/></a><p className="data-note">Al incorporarlo se moverá de Radar al Directorio interno como perfil pendiente de completar. Revisa identidad, foto y vídeo antes de hacerlo.</p></div><button className="edit" onClick={()=>{convert(candidate.name);close()}}><span>Incorporar al Directorio interno</span><ArrowUpRight size={16}/></button></aside></div>}
function PersonSheet({person,close,save}:{person:Person;close:()=>void;save:(person:Person)=>void}){
 useEffect(()=>{const closeOnBackdrop=(event:MouseEvent)=>{const target=event.target;if(target instanceof HTMLElement&&target.classList.contains('overlay'))close()};document.addEventListener('mousedown',closeOnBackdrop);return()=>document.removeEventListener('mousedown',closeOnBackdrop)},[close]);
 const [note,setNote]=useState(person.internalNote||''); const [decision,setDecision]=useState<Recommendation>(person.recommendation||'pendiente');
 const [editing,setEditing]=useState(false); const [draft,setDraft]=useState(person);
 const linkedForums=forums.filter(forum=>forum.people.some(name=>normalizeDirectoryName(name)===normalizeDirectoryName(person.name)));
 const verifiedTopics=verifiedForumTopicsFor(person);
 const linkedinSearch=`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${person.name} ${person.company}`)}`;
 const changed=note!==person.internalNote||decision!==person.recommendation;
 const updateDraft=(field:keyof Person,value:string)=>setDraft(current=>({...current,[field]:value}));
 const saveAll=()=>{save({...draft,tags:draft.tags,initials:draft.name.split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase(),recommendation:decision,internalNote:note});setEditing(false)};
 if(editing)return <div className="overlay"><aside className="sheet edit-sheet"><button className="close" onClick={close}><X size={20}/></button><p className="eyebrow">EDICIÓN COMPLETA</p><h2>Editar ficha</h2><div className="edit-grid">{[['name','Nombre y apellidos'],['role','Cargo'],['company','Empresa u organización'],['place','País o ubicación'],['email','Email'],['phone','Teléfono'],['linkedinUrl','URL de LinkedIn'],['photoUrl','URL de foto profesional']].map(([field,label])=><label key={field}>{label}<input value={(draft[field as keyof Person] as string)||''} onChange={e=>updateDraft(field as keyof Person,e.target.value)}/></label>)}</div><label className="edit-field">Especialidades (separadas por comas)<input value={draft.tags.join(', ')} onChange={e=>setDraft(current=>({...current,tags:e.target.value.split(',').map(tag=>tag.trim()).filter(Boolean)}))}/></label><label className="edit-field">Biografía<textarea value={draft.bio} onChange={e=>updateDraft('bio',e.target.value)}/></label><label className="edit-field">Estado<select value={draft.state} onChange={e=>setDraft(current=>({...current,state:e.target.value as Person['state']}))}><option>Activo</option><option>Pendiente</option></select></label><div className="modal-actions"><button onClick={()=>{setDraft(person);setEditing(false)}}>Cancelar</button><button className="new-button" onClick={saveAll}>Guardar todos los cambios</button></div></aside></div>;
 return <div className="overlay"><aside className="sheet"><button className="close" onClick={close}><X size={20}/></button><div className="profile-hero"><Avatar person={person} size="large"/><div><span className={'badge '+person.state.toLowerCase()}>{person.state}</span><h2>{person.name}</h2><p>{person.role}</p><p>{person.company}</p></div></div><section className="verified-topics"><div><h3>Temas verificados en Foro UNIR</h3><span>Solo se asignan al vincular una participación</span></div><div className="tag-set">{verifiedTopics.length?verifiedTopics.map(t=><Tag key={t}>{t}</Tag>):<span className="unverified-topic">Pendiente de contrastar</span>}</div></section><div className="contact"><h3>Contacto y presencia profesional</h3>{[[Mail,person.email],[Phone,person.phone],[MapPin,person.place]].map(([Icon,label]:any)=><p key={label}><Icon size={16}/>{label||'Pendiente de completar'}</p>)}<a className="profile-resource" href={person.linkedinUrl||linkedinSearch} target="_blank" rel="noreferrer"><Linkedin size={16}/>{person.linkedinUrl?'Abrir perfil de LinkedIn':'Buscar perfil en LinkedIn'}<ArrowUpRight size={13}/></a>{person.photoUrl?<span className="photo-state verified"><ImagePlus size={15}/>Foto profesional verificada</span>:<a className="photo-state" href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${person.name} ${person.company} foto profesional`)}`} target="_blank" rel="noreferrer"><ImagePlus size={15}/>Buscar foto para verificar<ArrowUpRight size={13}/></a>}</div><div className="bio"><h3>Biografía</h3><p>{person.bio}</p></div><div className="internal-feedback"><div><h3>Valoración interna</h3><span>Solo para el equipo UNIR</span></div><div className="recommendations"><button className={decision==='repetir'?'selected positive':''} onClick={()=>setDecision('repetir')}><ThumbsUp size={15}/>Nos gustó</button><button className={decision==='no_repetir'?'selected negative':''} onClick={()=>setDecision('no_repetir')}><ThumbsDown size={15}/>No repetir</button></div><label><MessageSquare size={15}/>Notas del equipo<textarea value={note} onChange={event=>setNote(event.target.value)} placeholder="Qué funcionó, qué mejorar y para qué formato lo recomendarías."/></label>{changed&&<button className="save-feedback" onClick={()=>save({...person,recommendation:decision,internalNote:note})}>Guardar valoración</button>}</div><div className="participation"><div><h3>Historial de participaciones</h3><button><Plus size={15}/>Añadir</button></div>{linkedForums.length?linkedForums.map(forum=><article key={forum.name}><span>{forum.theme.toUpperCase()} · {forum.date.toUpperCase()}</span><h4>{forum.name}</h4>{person.rating&&<p className="stars">{'★'.repeat(person.rating)}{'☆'.repeat(5-person.rating)}</p>}<div className="intervention-links">{forum.sourceUrl&&<a href={forum.sourceUrl} target="_blank" rel="noreferrer">Ver ficha del foro UNIR <ArrowUpRight size={13}/></a>}{forum.youtubeUrl?<a href={forum.youtubeUrl} target="_blank" rel="noreferrer">Ver intervención en YouTube <ArrowUpRight size={13}/></a>:<a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${person.name} ${forum.name} UNIR`)}`} target="_blank" rel="noreferrer">Buscar intervención en YouTube <ArrowUpRight size={13}/></a>}</div>{person.internalNote&&<p>“{person.internalNote}”</p>}</article>):<p className="empty">Todavía no hay participaciones registradas.</p>}</div><button className="edit" onClick={()=>setEditing(true)}><span>Editar ficha completa</span><ArrowUpRight size={16}/></button></aside></div>
}
type NewPerson = Pick<Person,'name'|'role'|'company'|'tags'|'place'|'state'|'photoUrl'|'linkedinUrl'>;
function AddPerson({close,add}:{close:()=>void;add:(p:NewPerson)=>void}){const [name,setName]=useState('');const [role,setRole]=useState('');const [company,setCompany]=useState('');const [photoUrl,setPhotoUrl]=useState('');const [linkedinUrl,setLinkedinUrl]=useState('');return <div className="overlay"><div className="modal"><button className="close" onClick={close}><X size={20}/></button><p className="eyebrow">NUEVO REGISTRO</p><h2>Añadir persona</h2><p className="modal-desc">Antes de guardar, se comprobarán coincidencias por nombre, email y LinkedIn al conectar Supabase.</p><label>Nombre y apellidos<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ej. María García"/></label><label>Cargo<input value={role} onChange={e=>setRole(e.target.value)} placeholder="Ej. Directora de..."/></label><label>Empresa u organización<input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Ej. Universidad UNIR"/></label><label><span className="label-with-icon"><Linkedin size={14}/>URL de LinkedIn</span><input value={linkedinUrl} onChange={e=>setLinkedinUrl(e.target.value)} placeholder="https://www.linkedin.com/in/..."/></label><label><span className="label-with-icon"><ImagePlus size={14}/>URL de foto profesional</span><input value={photoUrl} onChange={e=>setPhotoUrl(e.target.value)} placeholder="https://..."/></label><div className="modal-actions"><button onClick={close}>Cancelar</button><button className="new-button" disabled={!name} onClick={()=>add({name,role,company,tags:[],place:'Por completar',state:'Pendiente',photoUrl:photoUrl.trim()||undefined,linkedinUrl:linkedinUrl.trim()||undefined})}>Guardar persona</button></div></div></div>}
