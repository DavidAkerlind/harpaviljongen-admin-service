# Harpaviljongen Admin Service

## 📖 Översikt

Harpaviljongen Admin Service är en modern webbapplikation byggd för att hantera administration av restaurang- och eventverksamhet. Tjänsten fungerar som ett komplett administrativt kontrollpanel för att hantera menyer, events, öppettider och systemövervakning.

## 🛠️ Teknisk Stack

### Frontend

-   **React 18** - Modern komponentbaserat UI-ramverk
-   **Material-UI (MUI)** - Elegant designsystem och komponenter
-   **React Router** - Navigation och routing
-   **Axios** - HTTP-klient för API-kommunikation
-   **Vite** - Snabb utvecklingsserver och build-verktyg

### Backend Integration

-   **RESTful API** - Kommunicerar med Harpaviljongen Database API
-   **JWT Authentication** - Säker tokenbaserad autentisering
-   **Session Storage** - Säker tokenhantering

## 🚀 Huvudfunktioner

### 1. Dashboard

-   **Systemövervakning** - Realtidsövervakning av API- och databasstatus
-   **Statistik** - Överblick över menyer, items och events
-   **Snabbnavigation** - Direktlänkar till huvudfunktioner

### 2. Menyhantering

-   **CRUD-operationer** - Skapa, läsa, uppdatera och ta bort menyer
-   **Itemhantering** - Hantera maträtter, priser och tillgänglighet
-   **Aktivering/Deaktivering** - Toggle-funktionalitet för items
-   **Kategorisering** - Organisera items efter typ

### 3. Eventhantering

-   **Eventplanering** - Skapa och hantera events (DJ, vinprovning, privata events)
-   **Tidshantering** - Datum, start- och sluttider
-   **Kategorisering** - Olika eventtyper med färgkodning
-   **Beskrivningar** - Kort och lång beskrivning för events

### 4. Öppettidehantering

-   **Veckoplaner** - Hantera öppettider för alla veckodagar
-   **Flexibilitet** - Enkelt uppdatera tider per dag
-   **Svenska veckonamn** - Måndag till Söndag

### 5. Sökning

-   **Global sökning** - Sök genom alla menyer och items
-   **Snabb navigation** - Direkta länkar till sökresultat

## 🔐 Säkerhet & Autentisering

### Säkerhetsfunktioner

-   **JWT-tokens** - Säker autentisering med Bearer tokens
-   **Protected Routes** - Alla administrativa sidor kräver inloggning
-   **Session Management** - Automatisk utloggning vid tokenexpiration
-   **HTTPS** - Säker kommunikation med backend

### Användarhantering

-   **Enkel inloggning** - Användarnamn och lösenord
-   **Automatisk omdirigering** - Till login vid unauthorized access
-   **Säker utloggning** - Rensar tokens och session

## 📱 Användargränssnitt

### Responsiv Design

-   **Mobile-first** - Optimerad för alla skärmstorlekar
-   **Hamburger-meny** - Mobilanpassad navigation
-   **Touch-friendly** - Stora knappar och touch-targets

### UX-funktioner

-   **Loading States** - Visuell feedback under datahämtning
-   **Error Handling** - Tydliga felmeddelanden
-   **Confirm Dialogs** - Säkerhetsbekräftelse för kritiska operationer
-   **Fade Animations** - Mjuka övergångar mellan sidor

## 🔄 API-integration

### Endpoint-struktur

```
/api/menus - Menyhantering
/api/events - Eventhantering
/api/openingHours - Öppettidehantering
/api/auth - Autentisering
```

### Datahantering

-   **Real-time updates** - Automatisk uppdatering av data
-   **Error recovery** - Robust felhantering
-   **Optimistic updates** - Snabb användarfeedback

## 📊 Systemövervakning

### Health Checks

-   **API-status** - Övervakar backend-tillgänglighet
-   **Response times** - Mäter API-latens
-   **Visual indicators** - Färgkodade statusindikatorer

### Metrics

-   **Menu statistics** - Antal menyer och items
-   **Active items** - Procentuell fördelning
-   **Event tracking** - Kommande events

## 🎯 Användningsområden

### Restaurangpersonal

-   **Daglig menyuppdatering** - Snabbt aktivera/deaktivera rätter
-   **Prisändringar** - Enkelt uppdatera priser
-   **Specialmenyer** - Skapa säsongsmenyer

### Eventkoordinatorer

-   **Eventplanering** - Planera DJ-kvällar, vinprovningar
-   **Gästinformation** - Hantera eventbeskrivningar
-   **Schemaläggning** - Koordinera eventtider

### Restaurangchefer

-   **Överblick** - Dashboard med nyckelmetrics
-   **Systemstatus** - Övervaka teknisk drift
-   **Öppettider** - Hantera säsongsöppettider

## 🔧 Installation

### Utvecklingsmiljö

```bash
npm install
npm run dev
```

### Miljövariabler

-   API-endpoints konfigureras i `apiService.js`
-   Växling mellan lokal och produktionsmiljö

## 📈 Fördelar

### Effektivitet

-   **Centraliserad hantering** - Allt på ett ställe
-   **Snabb respons** - Optimerad prestanda
-   **Intuitivt gränssnitt** - Kort inlärningskurva

### Tillförlitlighet

-   **Robust felhantering** - Graceful degradation
-   **Data integrity** - Säker datahantering
-   **Backup-funktionalitet** - Säker datalagring

### Skalbarhet

-   **Modulär arkitektur** - Lätt att utöka
-   **API-driven** - Flexibel backend-integration
-   **Komponentbaserad** - Återanvändbara UI-komponenter

## 🎨 Design Philosophy

### Material Design

-   **Konsekvent UI** - Följer Material Design-principer
-   **Tillgänglighet** - WCAG-kompatibel design
-   **Färgkodning** - Intuitiv visuell feedback

### Användarcentrerat

-   **Arbetsflödesoptimering** - Designat för daglig användning
-   **Minimal friktion** - Få klick till målet
-   **Kontextuell hjälp** - Tooltips och bekräftelser

Harpaviljongen Admin Service är den kompletta lösningen för modern restaurangadministration - kombinerar kraftfull funktionalitet med elegant design för att göra daglig drift smidig och effektiv.

---

🧑‍💻 Byggt av [David Åkerlind](https://github.com/DavidAkerlind)
