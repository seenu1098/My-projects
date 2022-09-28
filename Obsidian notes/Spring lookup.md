
Lookup annotation

    If the prototype scope class is injected into an singleton scope class ,we can't get respective results because of singleton scope it will generate the same reference that won't give accurate results like weather reports for the each time it will give the same weather reports. So, to overcome this spring offers lookup annotation
    @lookup
    Private WeatherService getweatherServiceBean() {
      return null;
    }

It may look like return null but spring inside implementing this method with the help of lookup annotation

By using this below code applicationContext.getBean(WeatherService.class).getTemperature();

So it Will return getWeatherServiceBean(). getTemperature();


It have alternative ways of achieving this scenario which are below


applicationContext.getBean(WeatherService.class). getTemperature()

We can't implement this, we should not generate object, spring should update this.

@Autowired
ObjectFactory<WeatherService> weatherServiceObjectFactory;

Inside method :

weatherServiceObjectFactory.getObject().getTempearture();

We can't implement this also because object factory is eager initialize it will gill up the memory


Criterias that need to follow to implement the lookup annotation which are below 

  Class should not be declared with final modifier

  Methods that's gonna be autowired should not be declared with final, static, private modifier
,....,............................................................