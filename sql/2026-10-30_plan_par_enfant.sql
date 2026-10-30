-- 30/10/2026 (après-midi) : contrôles et erreurs de copie rattachés à un enfant ; genre de l'enfant pour accorder les textes
alter table rv_plan add column if not exists student_id uuid references rv_profiles(id) on delete cascade;
alter table rv_profiles add column if not exists gender text check (gender in ('f','m'));
-- rv_plan_rows(p_family, p_student default null) : lignes de la famille ; pour un élève, seulement les siennes et celles sans enfant
-- rv_plan_add(..., p_child uuid default null) ; rv_child_add(..., p_gender) ; rv_child_set(..., p_gender : 'f' | 'm' | 'x' = effacer | null = inchangé)
-- rv_get_state et rv_dashboard renvoient aussi 'gender' ; chaque ligne de plan renvoie 'student'
-- (définitions complètes appliquées via les migrations Supabase plan_par_enfant_genre et dashboard_gender)
