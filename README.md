# 🏋️ Spingi! - Workout Tracker

## Panoramica
Web app completa per il tracking degli allenamenti, progettata per sostituire la scheda cartacea. Funziona come PWA (Progressive Web App) — può essere aggiunta alla schermata home del telefono.

## 🚀 Come avviare
```bash
npm run dev
```
Poi apri **http://localhost:3000/** nel browser.

## 📱 Come usarla su mobile
1. Apri l'URL dal telefono (stessa rete Wi-Fi)
2. **iOS**: Safari → Condividi → "Aggiungi alla schermata Home"
3. **Android**: Chrome → Menu → "Aggiungi a schermata Home"

## 🎯 Funzionalità

### Autenticazione & Profilo
- Onboarding in 2 step (welcome → dati personali)
- Dati: nome, età, peso, altezza, genere, obiettivo
- Calcolo BMI automatico
- Tutto salvato in localStorage

### Gestione Schede (Workouts)
- Creazione schede con esercizi illimitati
- Per ogni esercizio: nome, gruppo muscolare, serie, ripetizioni, peso, tempo riposo, note
- Riordinamento drag (su/giù), modifica, eliminazione
- Esercizi espandibili/collassabili per un'interfaccia pulita

### Sessione Guidata 🔥
- **Guida passo-passo**: mostra un esercizio alla volta
- **Dettagli completi**: serie, reps, peso, note di esecuzione
- **Set tracker visuale**: pallini cliccabili per ogni serie
- **Timer riposo circolare**: preimpostato, si avvia al completamento di ogni set
- **Barra di progresso**: percentuale di completamento
- **Prossimi esercizi**: anteprima di cosa viene dopo
- **Auto-save**: se chiudi l'app, puoi riprendere dove eri
- **Vibrazione**: al termine del timer riposo (mobile)

### Statistiche
- Allenamenti totali, tempo totale, set totali, media sessione
- Grafico attività ultimi 7 giorni
- Schede più utilizzate
- Cronologia completa sessioni
- Filtro per periodo (settimana/mese/tutto)

### Schermata Completamento
- Riepilogo dettagliato post-allenamento
- Tempo totale, esercizi completati, set totali
- Tempo per ogni singolo esercizio

## 🎨 Design
- **Dark theme** con accenti viola/verde elettrico
- **Glassmorphism** e gradienti moderni
- **Micro-animazioni** su ogni interazione
- **Mobile-first** (max 480px, ottimizzato per telefono)
- **Font Inter** da Google Fonts
- **Timer circolare SVG** con gradiente animato

## 📁 Struttura
```
src/
├── main.jsx          # Entry point React
├── App.jsx           # Router, context, layout
├── index.css         # Design system completo
├── utils/
│   └── storage.js    # LocalStorage abstraction
├── components/
│   ├── BottomNav.jsx # Navigazione bottom tab
│   ├── Icons.jsx     # Icone SVG inline
│   └── Toast.jsx     # Notifiche toast
└── pages/
    ├── LoginPage.jsx          # Onboarding/login
    ├── HomePage.jsx           # Dashboard
    ├── WorkoutsPage.jsx       # Lista schede
    ├── WorkoutEditorPage.jsx  # Crea/modifica scheda
    ├── WorkoutSessionPage.jsx # Sessione guidata
    ├── WorkoutCompletePage.jsx # Riepilogo post-workout
    ├── StatsPage.jsx          # Statistiche
    └── ProfilePage.jsx        # Profilo utente
```

## 🔧 Tech Stack
- **React 19** + **Vite 8**
- **React Router DOM** (HashRouter per PWA)
- **CSS Custom** (design system completo, no framework)
- **localStorage** per persistenza dati
- **Zero dipendenze UI** - tutto custom
