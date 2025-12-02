-- PostgreSQL function for station scraping statistics

CREATE OR REPLACE FUNCTION get_station_scraping_stats()
RETURNS TABLE (
  station_id UUID,
  station_name TEXT,
  railway TEXT,
  total_jobs INTEGER,
  completed_jobs INTEGER,
  pending_jobs INTEGER,
  failed_jobs INTEGER,
  total_restaurants_found INTEGER,
  total_restaurants_new INTEGER,
  total_restaurants_updated INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS station_id,
    s.name AS station_name,
    s.railway,
    COUNT(j.id)::INTEGER AS total_jobs,
    COUNT(CASE WHEN j.status = 'completed' THEN 1 END)::INTEGER AS completed_jobs,
    COUNT(CASE WHEN j.status = 'pending' THEN 1 END)::INTEGER AS pending_jobs,
    COUNT(CASE WHEN j.status = 'failed' THEN 1 END)::INTEGER AS failed_jobs,
    COALESCE(SUM(j.restaurants_found), 0)::INTEGER AS total_restaurants_found,
    COALESCE(SUM(j.restaurants_new), 0)::INTEGER AS total_restaurants_new,
    COALESCE(SUM(j.restaurants_updated), 0)::INTEGER AS total_restaurants_updated
  FROM stations s
  LEFT JOIN scraping_jobs j ON s.id = j.station_id
  WHERE s.is_active = true
  GROUP BY s.id, s.name, s.railway
  ORDER BY total_restaurants_new DESC;
END;
$$ LANGUAGE plpgsql;
