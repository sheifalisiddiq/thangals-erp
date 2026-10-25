# THANGALS ERP — Business Requirements Specification

## Preamble
Build a complete ERP for **THANGALS**, a gold and jewellery business covering retail, wholesale, bullion trading, manufacturing, repairs, purchasing, inventory, accounting and customer management. Use the 24-role feature list and shared system features below as the functional scope. Maintain every listed module and permission boundary.

**Design direction:** premium jewellery ERP, emerald-and-gold branding, practical business workspace. Readable tables, clear financial info, fast navigation, efficient data entry.

**Colour palette:**
| Purpose | Colour |
|---|---|
| Sidebar and primary brand | Deep emerald `#00483B` |
| Primary buttons and active controls | Emerald `#006653` |
| Brand accents | Warm gold `#C5A16D` |
| Main workspace | Warm ivory `#F7F8F5` |
| Cards, tables and forms | White `#FFFFFF` |
| Primary text | Charcoal `#182824` |
| Secondary text | Slate green `#64736D` |
| Borders | Soft grey `#DFE6E1` |
| Selected navigation background | Pale emerald `#E7F2EC` |

**Application layout:** fixed emerald sidebar with logo; white top bar (title, breadcrumb, search, branch selector, financial year, notifications, user menu); light ivory content; collapsible sidebar groups; role-specific nav/dashboards; desktop-first responsive; mobile screens for artisans/stock scanning/QC/dispatch; separate external portal layouts.

**Typography/components:** Inter-like sans-serif; tabular numerals for money/weight/rates/qty; distinguish grams/kg/pieces/carats/purity; consistent decimal precision; ~10px card radii; clear button hierarchy; icon tooltips; text-based status badges; no decorative gradients/oversized cards.

> **Open requirements note:** the original spec text referenced Indian currency formatting (INR) and an English/Hindi interface option. This has been superseded by explicit project direction: **AED is the current display currency, and currency/tax are implemented as configurable settings rather than hardcoded to any one country's rules.** No Hindi localization has been requested and it is treated as out of scope unless asked for.

**Owner dashboard sections:** sales/collections/receivables/GP; cash & bank; gold holdings by purity + fine-gold equivalent; inventory cost vs reference value (shown separately); retail/wholesale/online/bullion performance; branch comparisons & trends; production progress/wastage/recovery; open bullion exposure & unsettled trades; pending approvals/discrepancies/overdue work; recent transactions & quick actions. Date/branch/channel filters; every metric opens its report; show rate/valuation timestamps.

**Tables/detail screens:** search/filter/sort/pagination/column selection; sticky headers; saved views; permission-controlled exports; photo thumbnails; detail tabs (Summary, Items, Payments, Documents, Approvals, History); empty/loading/error/permission-denied states; confirmation+reason fields for sensitive changes.

**Forms/operational screens:** short labelled sections; pricing breakdowns (metal/stones/making charges/discount/tax); visible running totals; barcode/weighing-scale input support; stock ownership/location/custody shown separately; focused billing/receiving/assay/production/repair workspaces; preserve data on validation failure; distinguish drafts/approved/posted.

**Implementation expectations:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui; reusable components + centralized design tokens; permissions enforced in the UI (this is a frontend-only demo — clearly label that there is no backend); decimal-safe money/metal math; realistic connected demo data labelled as demo; transactions must update stock/metal/financial records consistently; all 24 roles available, employees may hold multiple roles; maintain feature checklist against this scope; flag incomplete features/external integrations; use the project's own logo assets (`public/brand/logo-dark.jpg` / `logo-light.jpg`).

## The 18 Navigation Groups / Modules
1. Overview
2. Customers & CRM
3. Retail Sales
4. Wholesale & Dealers
5. Bullion Trading
6. Inventory & Vault
7. Purchases & Suppliers
8. Old Gold & Exchanges
9. Manufacturing & Karigars
10. Quality & Hallmarking
11. Repairs & Alterations
12. Dispatch & Transfers
13. Finance & Accounting
14. Savings Schemes & Loyalty
15. E-commerce & Catalogue
16. Employees & Payroll
17. Reports & Audit
18. Administration

(Each user sees only the groups/records their permissions allow.)

## The 24 Roles
1. Owner / Super Admin
2. System Administrator
3. Branch / Showroom Manager
4. Receptionist / Front Desk Executive
5. Retail Sales Executive
6. Wholesale Sales Executive
7. Cashier / Billing Executive
8. Inventory / Vault Controller
9. Purchase / Procurement Executive
10. Bullion Trading Executive
11. Gold Assayer / Exchange Evaluator
12. Production / Manufacturing Manager
13. Karigar / Artisan
14. Quality Control / Hallmarking Officer
15. Repairs / Alterations Executive
16. Accountant / Finance Manager
17. CRM / Customer Service Executive
18. E-commerce / Catalogue Manager
19. Dispatch / Logistics Executive
20. HR / Payroll Manager
21. Auditor / Compliance Officer
22. Customer / Dealer Portal User
23. Supplier Portal User
24. External Karigar / Job Worker Portal User

## Full per-role feature lists

**1. Owner / Super Admin**
*Dashboard/visibility:* Consolidated overview of all companies/branches/showrooms/warehouses/vaults; retail/wholesale/bullion/online sales; revenue/collections/refunds/outstanding payments; gross/net profit/expenses; cash/bank/payment-channel balances; inventory qty/weight/cost/reference value; gold balances by purity + fine-gold equivalent; silver/platinum/diamond/gemstone inventory; customer-owned/supplier-owned/company-owned stock; stock held by artisans/dealers/third parties; production progress/wastage/recovery; bullion positions/unsettled trades/exposure; customer receivables & supplier payables; branch/employee/salesperson performance; overdue orders/repairs/deliveries/payments; pending approvals and stock discrepancies.
*Modules/permissions:* access to every module; company/branch/warehouse/vault setup; user roles & business permissions; gold rates/buying/selling rates; pricing/making charges/margin policies; discount/credit/refund/approval limits; purchase & supplier payment approvals; stock adjustment & write-off approvals; bullion trading limits & rate-fixing approvals; production wastage & metal-loss approvals; savings scheme configuration; financial reports/budgets/period closing; audit history & authorized data exports.

**2. System Administrator** — user creation/deactivation/access recovery; role & permission configuration; company/branch access assignments; login security & MFA; session/device management; system settings & document templates; numbering sequences & financial-year config; custom fields & master-data config; integration settings & connection status; barcode scanners/printers/weighing-scale config; data import tools & migration logs; backup status & restore admin; technical logs & system health; access logs & permission-change history; financial/customer-data access only when separately authorized.

**3. Branch / Showroom Manager** — branch sales/collections/outstanding balances; branch stock by item/purity/weight/location; staff attendance/targets/sales performance; customer inquiries & salesperson assignments; quotations/reservations/orders; discounts & pricing exceptions within limits; returns/exchanges/refund requests; branch purchasing requests; stock transfer requests & receipts; daily opening/closing stock counts; cash closing & discrepancy review; repairs & custom-order progress; approval-stock & consignment balances; customer complaints & escalations; branch expenses & permitted profitability reports; branch-level reports & approval history.

**4. Receptionist / Front Desk Executive** — customer registration/contact details; walk-in inquiries & visit history; appointment calendar; salesperson availability & customer assignment; product catalogue & approved display prices; customer order/repair status; collection appointments; customer document collection; service requests & complaints; visitor notes & follow-up tasks; delivery/collection acknowledgement requests; NO access to purchase costs, profits, financial ledgers, or vault adjustments.

**5. Retail Sales Executive** — jewellery catalogue/images/specs; item availability by branch; purity/gross weight/net metal weight/stone details; approved gold rates & selling prices; making charges & permitted discounts; customer profiles & purchase history; assigned inquiries & follow-ups; quotations & revisions; item reservations & expiry; sales orders & advance-payment status; custom jewellery requirements & design refs; old-gold exchange requests & approved valuations; returns & exchange requests; customer wish lists & preferences; own targets/sales/commission statements; NO access to company-wide profits or unrestricted stock changes.

**6. Wholesale Sales Executive** — dealer/business-customer accounts; dealer-specific catalogues & price lists; bulk quotations & sales orders; weight-based & piece-based sales; purity-wise & fine-gold-based pricing; dealer credit limits & available credit; outstanding invoices & receivables aging; advances & customer metal balances; rate-fixed/rate-unfixed orders; partial fulfilment & backorders; goods issued on approval; consignment issues/sales/returns; dealer returns & credit-note requests; delivery schedules & dispatch status; dealer statements & settlement history; assigned sales targets & commissions.

**7. Cashier / Billing Executive** — approved retail & wholesale orders; customer billing & tax details; itemized metal/stone/making-charge breakdowns; sales invoices & permitted corrections; advance receipts & allocations; cash/card/UPI/bank/split payments; payment verification status; customer balances & receipts; approved old-gold exchange credits; credit notes & authorized refunds; savings scheme redemption against purchases; till opening balances; cash receipts/payouts/till transfers; daily cashier closing & reconciliation; invoice reprints & receipt history; e-invoice submission status; NO authority to change purity, stock cost, or approved valuation.

**8. Inventory / Vault Controller** — item/batch/bullion-bar records; barcode/QR/optional RFID tags; item photographs & certificates; gross/stone/net metal weight & purity; fine-gold equivalent & metal classification; diamond/gemstone weights in carats; branch/warehouse/counter/tray/bin/vault locations; purchase receiving & goods-receipt records; item tagging & label printing; stock issue/return records; stock reservations & release requests; interbranch transfers & stock in transit; vault-to-counter custody movements; production material issues/returns; scrap/dust/filings/recovered-metal stock; hallmarking dispatches & receipts; approval & consignment stock; customer-owned jewellery & repair custody; physical counts & discrepancy submissions; damaged/quarantined/missing/blocked stock; stock aging & slow-moving inventory; stock adjustments subject to approval.

**9. Purchase / Procurement Executive** — supplier profiles & approved lists; supplier catalogues & price agreements; purchase requests & quotations; supplier comparisons; purchase orders (jewellery/bullion/stones/consumables); rate-fixed/unfixed purchases; weight-based/piece-based/metal-account purchases; supplier advances & payment status; expected deliveries & pending quantities; goods-receipt & quality-inspection status; purchase invoice matching; purchase returns & debit-note requests; supplier-owned approval/consignment goods; supplier metal balances & settlement proposals; refining/subcontracting POs; import purchase docs & landed-cost records; supplier performance & purchase history.

**10. Bullion Trading Executive** — gold/silver bars/coins/bullion inventory; bar serial numbers/refinery/purity/weight; approved buy/sell rate boards; counterparty profiles & trading limits; buy/sell trade tickets; rate-fixed/unfixed contracts; partial rate fixing & remaining unfixed qty; trade advances & payment balances; physical delivery & receipt schedules; money & metal settlement records; open positions & exposure; realized trading profit & permitted valuation reports; premiums/charges/commissions; counterparty outstanding balances; trade amendments & cancellation requests; exposure-limit exceptions requiring approval.

**11. Gold Assayer / Exchange Evaluator** — old-gold purchase & exchange intake; customer/item identification; intake photographs & condition notes; gross weight & non-gold deductions; testing method & assay results; tested purity & fine-gold equivalent; approved buying rates; melting/refining/other permitted deductions; proposed purchase/exchange valuation; customer acceptance records; valuation approval status; accepted/rejected item records; item custody & handover history; refinery dispatch & final assay comparison; NO independent approval of own valuation or payout.

**12. Production / Manufacturing Manager** — custom orders & stock-production orders; designs/versions/customer approvals; BOMs & production specs; target weight/purity/size/stone requirements; production planning & capacity; internal artisan & external job-worker allocation; job cards & stage schedules; casting/rolling/cutting/soldering/setting/polishing stages; metal/alloy/stone issues; material returned & unused components; WIP inventory; subcontracting & external job work; expected/actual labour costs; expected/actual metal consumption; wastage allowances & variance; scrap/dust/metal recovery; refining/melting batches; finished-goods receipt & costing; QC failures & rework; job-worker metal & money balances; production delays & delivery commitments.

**13. Karigar / Artisan** — assigned job cards; design images & approved specs; required size/purity/weight/stones; materials issued & receipt acknowledgement; assigned production stages & deadlines; work progress & completion quantities; material usage entries; finished-item weight submission; scrap/unused metal/stone returns; wastage explanations; rework instructions & status; job photographs & notes; own labour/settlement statements where permitted; NO access to company sales margins or unrelated jobs.

**14. Quality Control / Hallmarking Officer** — incoming/production/returned-item inspection queues; weight/purity/dimensions/finish checks; stone quality & setting checks; design/specification comparisons; defect photographs & inspection notes; pass/fail/quarantine/rework decisions; assay reports & certificates; hallmarking batch preparation; hallmarking centre details; dispatch & return reconciliation; HUID capture & item association; hallmarking charges & supporting records; certificate attachments; release-for-sale status; QC & hallmarking history.

**15. Repairs / Alterations Executive** — repair intake & customer details; item photographs & condition reports; received weight/purity/stones/accessories; customer-owned item custody records; repair type & requested alterations; estimates & customer approvals; technician/artisan assignment; material issues & additional-stone requirements; repair stages & work notes; revised estimates & additional approvals; final weight & component reconciliation; QC status & completion records; repair charges & payment status; collection schedules; delivery acknowledgement & repair warranty records.

**16. Accountant / Finance Manager** — chart of accounts & double-entry ledgers; sales/purchases/returns/credit-debit notes; customer & supplier accounts; customer/supplier advances; cash/banks/payment clearing accounts; bank reconciliation; AR/AP aging; dealer credit exposure; metal accounts & money-account reconciliation; bullion trade settlements; production & job-work accounting; inventory valuation & COGS; consignment & approval-stock accounting; expenses/reimbursements/petty cash; fixed assets & depreciation; payroll & commission postings; savings scheme collections/liabilities/redemptions; tax configuration & reporting; e-invoicing records; import/export financial records; budgets & cash-flow forecasts; P&L/balance sheet/trial balance; branch & consolidated financial reports; period closing/locks & authorized adjustments.

**17. CRM / Customer Service Executive** — customer/dealer profiles; communication preferences & consent records; inquiries & assigned follow-ups; appointment & visit history; quotations & order status; custom jewellery progress; repair & collection status; purchase history & customer preferences; complaints/service tickets/escalations; loyalty points & membership benefits; campaign lists & approved offers; customer feedback & satisfaction records; savings scheme enrollment & installment status; customer communication history; restricted access to sensitive identity documents.

**18. E-commerce / Catalogue Manager** — product catalogue & collections; product images/descriptions/specs; online publication status; approved online prices & offers; channel-specific stock allocation; online customer orders; payment & fulfilment status; order cancellation & return requests; shipping options & delivery charges; promotional codes & loyalty offers; website inquiry records; marketplace product & order records; product visibility & availability controls; online sales & conversion reports; NO unrestricted purchase-cost or accounting access.

**19. Dispatch / Logistics Executive** — approved delivery & pickup orders; packing lists & item verification; jewellery weight & package details; tamper-seal references; customer/dealer/branch delivery addresses; courier & secure-transport assignments; dispatch manifests & shipment tracking; insurance references & declared values; applicable transport/movement documents; stock-transfer dispatch & receipt status; hallmarking/refinery/job-worker shipments; proof of delivery & recipient acknowledgement; failed deliveries & returned shipments; chain-of-custody records; NO authority to alter selling prices or payment records.

**20. HR / Payroll Manager** — employee profiles & employment documents; department/role/branch assignments; attendance/shifts/leave/overtime; salary structures & payroll; sales commission rules & approved payouts; incentives & deductions; employee advances & reimbursements; performance targets & reviews; training & policy acknowledgements; joining/transfer/exit records; access-removal requests; staff-related reports; restricted access to personal and salary information.

**21. Auditor / Compliance Officer** — read-only access to authorized business records; sales/purchase/financial transaction history; invoice/receipt/document sequences; tax records & submission references; hallmarking & assay records; customer-identification records where authorized; cash transaction & exception reports; stock-count & discrepancy history; inventory ownership & custody records; bullion trades & settlement history; metal reconciliation & production wastage; approval records & policy exceptions; user activity & permission-change history; reversed/amended/cancelled transactions; period-close records; audit findings & supporting-document exports; NO transaction editing, posting, or approval permissions.

**22. Customer / Dealer Portal User** — own profile & business details; approved product catalogue & assigned prices; own quotations & acceptance; own orders & delivery status; custom design approval; repair status; invoices/receipts/statements; outstanding balances & payment submissions; own advances & metal balances; dealer credit limit where applicable; approval & consignment items held; return & exchange requests; savings scheme installments & redemption status; loyalty benefits; support requests & document downloads; NO access to other customers or internal costs.

**23. Supplier Portal User** — own company & payment details; purchase orders issued to them; order acceptance & delivery commitments; shipment details & delivery documents; invoice submission; goods-receipt & rejection status; purchase returns; own payment & advance status; own metal & money statements; consignment stock supplied & settlement status; certificates & supporting documents; NO access to competing suppliers or company margins.

**24. External Karigar / Job Worker Portal User** — assigned job-work orders; approved designs & specifications; materials issued & receipt acknowledgement; stage progress & expected completion; finished-item submission; scrap/stone/unused-metal returns; job-work delivery documents; QC results & rework requests; labour-charge submissions; own metal balance & reconciliation; own invoices & settlement statements; NO access to unrelated production or customer finances.

## Shared System Features
Multiple companies/branches/showrooms/warehouses/vaults; retail/wholesale/bullion/manufacturing/online operations; gold/silver/platinum/diamonds/gemstones; separate units for pieces/grams/kilograms/carats; configurable purity & fine-metal calculations; separate company-owned/customer-owned/consignment inventory; separate stock cost, reference market value, and selling price; historical rates preserved against transactions; role/branch/record/approval-level permissions; maker-checker approval controls; search/filters/saved views/permitted exports; document attachments & photographs; transaction history & audit trails; reversals & controlled corrections for posted records; financial-period locks; desktop/tablet/mobile layouts; configurable currency (AED default, multicurrency-ready); barcode/QR/optional RFID/weighing-scale support (simulated frontend-only); branded invoices/receipts/quotations/job documents; data import/opening balances/migration tools (demo-only); backups/restore controls/security settings (demo-only, clearly labelled as non-production).
