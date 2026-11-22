# EDGE — mobilní trading aplikace (první funkční verze)

## Funkční části
- Mobilní/responzivní rozhraní, vhodné pro iPhone.
- PWA manifest a service worker; po nasazení na HTTPS lze přidat na plochu.
- Oficiální vložený TradingView Advanced Chart.
- Přepínání BTCUSD, XAUUSD, EURUSD, NAS100 a timeframe 1m až 1D.
- Scalping/Intraday předvolby.
- Ruční plánovač Entry / SL / TP s výpočtem R:R a lokálním journalem.
- Nahrání screenshotu a lokální náhled.

## Použité grafové symboly
- BTCUSD: `BINANCE:BTCUSDT` — referenční BTC/USDT trh, nikoli BTCUSD feed brokera.
- XAUUSD: `OANDA:XAUUSD`
- EURUSD: `FX:EURUSD`
- NAS100: `FOREXCOM:NSXUSD` — US 100 CFD; symbol a ceny se mohou lišit od brokera.

## Co ještě není hotové
Toto není kompletní AI scanner. Aplikace zatím **nečte svíčky z vloženého TradingView widgetu**, negeneruje AI obchodní signály, neposílá push notifikace a neběží na serveru na pozadí. Widget poskytuje graf a data uvnitř svého vlastního prostředí; aplikace z něj nesmí předpokládat přístup k OHLC datům.

Pro skutečný automatický scanner je nutné připojit samostatný licencovaný datový feed s OHLC daty, serverový proces, a teprve pak bezpečně přidat analýzu BOS/CHOCH, S/R, liquidity sweeps, FVG a price action. AI screenshot analysis vyžaduje serverové API připojení; API klíč nesmí být uložen v mobilním JavaScriptu. Push upozornění vyžadují serverovou push infrastrukturu. Záměrně nejsou zobrazeny falešné signály.

## Nasazení zdarma
1. Rozbal ZIP a nahraj obsah složky do nového GitHub repository.
2. V repository otevři Settings → Pages.
3. Zvol Deploy from a branch, `main`, `/ (root)` a ulož.
4. Po nasazení otevři HTTPS adresu v Safari na iPhonu.
5. Zvol Sdílet → Přidat na plochu.

Grafy potřebují internet; offline cache ukládá jen základní soubory aplikace.
