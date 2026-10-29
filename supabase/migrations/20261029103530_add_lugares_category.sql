begin;

insert into public.categories (slug, name, emoji, sort)
select 'lugares', 'Lugares emblemáticos', '🏛️', 3
where not exists (
  select 1 from public.categories where slug = 'lugares'
);

update public.categories
set name = 'Lugares emblemáticos', emoji = '🏛️'
where slug = 'lugares';

update public.categories
set sort = case slug
  when 'bebidas' then 1
  when 'comidas' then 2
  when 'lugares' then 3
  when 'paises' then 4
  when 'empresas' then 5
  when 'equipos' then 6
  when 'estrellas' then 7
  else sort
end
where slug in ('bebidas', 'comidas', 'lugares', 'paises', 'empresas', 'equipos', 'estrellas');

commit;

