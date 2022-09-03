-- liquibase formatted sql

-- changeset india:08162021-1002

UPDATE payment_subscription_details
SET yearly_price=0
WHERE id='fd29950c-f9a0-11eb-9a03-0242ac130003';

UPDATE payment_subscription_details
SET yearly_price=1800
WHERE id='fd2997aa-f9a0-11eb-9a03-0242ac130003';

UPDATE payment_subscription_details
SET yearly_price=4320
WHERE id='fd299a98-f9a0-11eb-9a03-0242ac130003';

UPDATE payment_subscription_details
SET  yearly_price=13800
WHERE id='fd299b6a-f9a0-11eb-9a03-0242ac130003';
