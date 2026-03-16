
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** comugest-ia
- **Date:** 2026-03-16
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Register with already-used email shows 'account exists' style error
- **Test Code:** [TC001_Register_with_already_used_email_shows_account_exists_style_error.py](./TC001_Register_with_already_used_email_shows_account_exists_style_error.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Server did not return an error message after submitting registration for an existing email (existing.user.e2e@example.com).
- No visible inline or toast error text containing Spanish words 'ya' or 'registrado' (or English 'already'/'registered') found on the page.
- Registration form remained displayed with all input fields visible after submission, indicating no server-side error banner or redirect occurred.
- Notifications region (aria-label='Notifications') contained no message indicating registration failure.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/eb56ea2d-0fa7-478d-9126-5003a608c16b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Login with missing required community code shows validation error
- **Test Code:** [TC002_Login_with_missing_required_community_code_shows_validation_error.py](./TC002_Login_with_missing_required_community_code_shows_validation_error.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Community code input field not found on login page
- Form submission blocked by browser validation for missing password rather than missing community code
- Validation tooltip displays English text 'Please fill out this field.' instead of Spanish 'requerido'/'obligatorio'
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/54db4af8-9bb4-4b01-a714-19033031b405
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Home dashboard loads with personalized welcome and key sections
- **Test Code:** [TC005_Home_dashboard_loads_with_personalized_welcome_and_key_sections.py](./TC005_Home_dashboard_loads_with_personalized_welcome_and_key_sections.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/ccdcef7f-abd5-4435-ba47-c2ae460815ed
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Quick action: create a new incident from Home
- **Test Code:** [TC006_Quick_action_create_a_new_incident_from_Home.py](./TC006_Quick_action_create_a_new_incident_from_Home.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/bdd88bd4-e73d-436f-84d4-64faa212c5f0
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Empty state: no notices present shows 'No hay avisos' message
- **Test Code:** [TC009_Empty_state_no_notices_present_shows_No_hay_avisos_message.py](./TC009_Empty_state_no_notices_present_shows_No_hay_avisos_message.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Empty-state message 'No hay avisos' not displayed on Home page when notices exist.
- Expected heading 'Últimos avisos' not found on Home page (actual 'Avisos' section and active aviso card present).
- Empty-state card for 'No hay avisos' is not visible on the Home dashboard.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/b82ed55d-6b36-4080-8864-aa48b29b55a0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Create a new incident with title and description and reach the incidents list
- **Test Code:** [TC012_Create_a_new_incident_with_title_and_description_and_reach_the_incidents_list.py](./TC012_Create_a_new_incident_with_title_and_description_and_reach_the_incidents_list.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/486a5cd5-3d2d-4d87-b15a-686908173e38
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Create a new incident and verify the new item appears in the incidents list
- **Test Code:** [TC013_Create_a_new_incident_and_verify_the_new_item_appears_in_the_incidents_list.py](./TC013_Create_a_new_incident_and_verify_the_new_item_appears_in_the_incidents_list.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/fbdc7324-09f9-4750-b85b-1e5a17dd916d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Validation: submitting with blank title shows 'Title is required' and stays on new incident page
- **Test Code:** [TC014_Validation_submitting_with_blank_title_shows_Title_is_required_and_stays_on_new_incident_page.py](./TC014_Validation_submitting_with_blank_title_shows_Title_is_required_and_stays_on_new_incident_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/44587d8f-2e5c-4c5a-bd4d-acf12204994c
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 View incidents list and filter by status 'Abierta' then open an incident detail
- **Test Code:** [TC018_View_incidents_list_and_filter_by_status_Abierta_then_open_an_incident_detail.py](./TC018_View_incidents_list_and_filter_by_status_Abierta_then_open_an_incident_detail.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- 'Adjuntos' label (Attachments) not found on the incident detail page; expected Spanish label is missing.
- 'Comentarios' label (Comments) not found on the incident detail page; expected Spanish label is missing.
- Incident detail navigation initially showed incomplete rendering (centered logo / notifications only) before the detail rendered, indicating a possible SPA rendering issue that may affect visibility of expected sections.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/94afb046-e131-4baa-8eed-7b11620fa9f2
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Admin creates and publishes a notice with AI-generated full and short versions
- **Test Code:** [TC019_Admin_creates_and_publishes_a_notice_with_AI_generated_full_and_short_versions.py](./TC019_Admin_creates_and_publishes_a_notice_with_AI_generated_full_and_short_versions.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/5ff1ac81-05e1-4687-8926-6707eddb5b23
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Neighbor views notices list and opens a notice detail
- **Test Code:** [TC020_Neighbor_views_notices_list_and_opens_a_notice_detail.py](./TC020_Neighbor_views_notices_list_and_opens_a_notice_detail.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No notices visible on /notices page; empty-state message 'No se encontraron comunicados para tu comunidad.' is displayed.
- Unable to open the first notice because there are no notice items or detail cards rendered on the page.
- Notices list content (titles, start/end dates, links) not available, so detail fields (Title, Full body, Start date, End date) cannot be verified.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/4574c9b1-21b4-4296-8b4c-bd14957d962d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Admin tries to publish a new notice with empty title and draft
- **Test Code:** [TC021_Admin_tries_to_publish_a_new_notice_with_empty_title_and_draft.py](./TC021_Admin_tries_to_publish_a_new_notice_with_empty_title_and_draft.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/acb572db-6681-487c-8847-e9e1b58f3f99
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Create a reservation with optional notes and see confirmation
- **Test Code:** [TC025_Create_a_reservation_with_optional_notes_and_see_confirmation.py](./TC025_Create_a_reservation_with_optional_notes_and_see_confirmation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/68d42494-0450-42e1-bc7e-2b4e0767a93e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 Reservation booking flow: select date/time, add notes, book, and confirm
- **Test Code:** [TC026_Reservation_booking_flow_select_datetime_add_notes_book_and_confirm.py](./TC026_Reservation_booking_flow_select_datetime_add_notes_book_and_confirm.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- CONFIRMAR RESERVA button was clicked but no confirmation UI appeared on the page.
- No success toast, confirmation panel, or any booking confirmation element is visible after clicking confirm.
- The booking details panel (showing Fecha/Hora/Duración) remains displayed and the confirm control is still present, indicating the reservation was not finalized.
- Current URL remains on the reservation booking page (no navigation to a confirmation page), so no post-booking redirect occurred.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/9ca4df27-8b24-494f-aad1-092c6e96f26a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC028 Attempt to book an already taken slot shows conflict error and recovery option
- **Test Code:** [TC028_Attempt_to_book_an_already_taken_slot_shows_conflict_error_and_recovery_option.py](./TC028_Attempt_to_book_an_already_taken_slot_shows_conflict_error_and_recovery_option.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No se encontró ningún elemento clickable correspondiente a los huecos marcados como 'Ocupado' en la vista de reserva; los horarios ocupados se renderizan como etiquetas no interactivas.
- La única hora con un elemento interactivo identificable es 18:00 (index 2716); los horarios 10:00, 12:00, 14:00 y 16:00 no expusieron un botón o control clickable para intentar reservar.
- Dado que no es posible seleccionar un hueco ya tomado en la UI actual, no se puede generar ni verificar el mensaje de error/conflicto esperado al intentar reservar un hueco ocupado.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8067f6a3-2b22-4191-b3f2-3397c66ec463/cebc917a-5f14-4db9-acb4-2b0fb004dc30
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **53.33** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---