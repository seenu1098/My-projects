package com.yorosis.yoroflow.creation.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.annotation.RabbitListenerConfigurer;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.RabbitListenerEndpointRegistrar;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.handler.annotation.support.DefaultMessageHandlerMethodFactory;
import org.springframework.messaging.handler.annotation.support.MessageHandlerMethodFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@EnableRabbit
@ConditionalOnProperty(prefix = "queue", name = "enabled", havingValue = "true")
public class RabbitConfig implements RabbitListenerConfigurer {
	public static final String DEFAULT_EXCHANGE = "yoroflow.direct";
	public static final String PROCESS_QUEUE = "process-queue";
	public static final String PROCESS_FAILED_QUEUE = "process-failed-queue";
	public static final String DEAD_PROCESS_QUEUE = "dead-process-queue";
	public static final String AUTOMATION_QUEUE = "automation-queue";
	public static final String EMAIL_QUEUE = "email-process-queue";

	@Autowired
	private ObjectMapper objMapper;

	@Bean
	Queue processQueue() {
		return QueueBuilder.durable(PROCESS_QUEUE).withArgument("x-dead-letter-exchange", "")
				.withArgument("x-dead-letter-routing-key", DEAD_PROCESS_QUEUE).withArgument("x-message-ttl", 600_000)
				.build();
	}

	@Bean
	Queue processFailedQueue() {
		return QueueBuilder.durable(PROCESS_FAILED_QUEUE).withArgument("x-message-ttl", 600_000).build();
	}

	@Bean
	Queue deadLetterQueue() {
		return QueueBuilder.durable(DEAD_PROCESS_QUEUE).build();
	}

	@Bean
	DirectExchange exchange() {
		return new DirectExchange(DEFAULT_EXCHANGE);
	}

	@Bean
	Binding processQueueBinding() {
		return BindingBuilder.bind(processQueue()).to(exchange()).with(PROCESS_QUEUE);
	}

	@Bean
	Binding processFailedQueueBinding() {
		return BindingBuilder.bind(processFailedQueue()).to(exchange()).with(PROCESS_FAILED_QUEUE);
	}

	@Bean
	public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
		final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
		rabbitTemplate.setMandatory(true);
		rabbitTemplate.setMessageConverter(producerJackson2MessageConverter());
		return rabbitTemplate;
	}

	@Bean
	public Jackson2JsonMessageConverter producerJackson2MessageConverter() {
		return new Jackson2JsonMessageConverter(objMapper);
	}

	@Bean
	MessageHandlerMethodFactory messageHandlerMethodFactory() {
		DefaultMessageHandlerMethodFactory messageHandlerMethodFactory = new DefaultMessageHandlerMethodFactory();
		messageHandlerMethodFactory.setMessageConverter(consumerJackson2MessageConverter());
		return messageHandlerMethodFactory;
	}

	@Override
	public void configureRabbitListeners(RabbitListenerEndpointRegistrar registrar) {
		registrar.setMessageHandlerMethodFactory(messageHandlerMethodFactory());
	}

	@Bean
	public MappingJackson2MessageConverter consumerJackson2MessageConverter() {
		return new MappingJackson2MessageConverter();
	}
}
